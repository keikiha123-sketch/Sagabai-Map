import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.15.0/dist/maplibre-gl.mjs';

import { LogoControl } from
    'https://cdn.jsdelivr.net/npm/@maptoolkit/maplibre-logo-control@1.1.2/dist/maplibre-logo-control.js';

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

import { spots } from './spots.js';

export const map = new maplibregl.Map({
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [130.29882001815872, 33.25991054249502],
    zoom: 16.12490081685308,
    pitch: 60,
    bearing: -11.684950804362188,
    container: 'map',
    canvasContextAttributes: {
        antialias: true
    }
});


// ========================================
// 1. クリック判定用の共通変数
// ========================================

const balloonLayers = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let activePopup = null;


// ========================================
// HTMLエスケープ
// ========================================

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entities[character];
    });
}


// ========================================
// 地図移動時にポップアップを閉じる
// ========================================

map.on('movestart', () => {
    if (activePopup) {
        activePopup.remove();
        activePopup = null;
    }
});


// ========================================
// 気球の布テクスチャを色変更用に変換
// ========================================

function createNeutralFabricTexture(sourceTexture) {
    const image = sourceTexture.image;

    const width = image?.width || image?.naturalWidth;
    const height = image?.height || image?.naturalHeight;

    if (!image || !width || !height) {
        return sourceTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
        return sourceTexture;
    }

    context.drawImage(image, 0, 0, width, height);

    const imageData = context.getImageData(
        0, 0, width, height
    );

    const data = imageData.data;

    let totalLuminance = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;

        const luminance =
            0.2126 * data[i] +
            0.7152 * data[i + 1] +
            0.0722 * data[i + 2];

        totalLuminance += luminance;
        pixelCount++;
    }

    const averageLuminance =
        pixelCount > 0 ? totalLuminance / pixelCount : 220;

    for (let i = 0; i < data.length; i += 4) {
        const luminance =
            0.2126 * data[i] +
            0.7152 * data[i + 1] +
            0.0722 * data[i + 2];

        const gray = Math.max(
            160,
            Math.min(
                255,
                245 + (luminance - averageLuminance) * 3.5
            )
        );

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }

    context.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        sourceTexture.colorSpace || THREE.SRGBColorSpace;

    texture.wrapS = sourceTexture.wrapS;
    texture.wrapT = sourceTexture.wrapT;
    texture.flipY = sourceTexture.flipY;

    texture.magFilter = sourceTexture.magFilter;
    texture.minFilter = sourceTexture.minFilter;
    texture.generateMipmaps = sourceTexture.generateMipmaps;
    texture.anisotropy = sourceTexture.anisotropy;

    texture.offset.copy(sourceTexture.offset);
    texture.repeat.copy(sourceTexture.repeat);
    texture.center.copy(sourceTexture.center);
    texture.rotation = sourceTexture.rotation;

    texture.needsUpdate = true;

    return texture;
}


// ========================================
// 気球の外袋に指定色を適用
// ========================================

function recolorBalloon(model, color) {
    const materialCache = new Map();
    const textureCache = new Map();

    function recolorMaterial(originalMaterial) {
        if (!originalMaterial) {
            return originalMaterial;
        }

        const name = originalMaterial.name || '';

        const isBalloonFabric =
            /balloon fabric|sailcloth/i.test(name);

        if (!isBalloonFabric) {
            return originalMaterial;
        }

        if (materialCache.has(originalMaterial.uuid)) {
            return materialCache.get(originalMaterial.uuid);
        }

        const material = originalMaterial.clone();

        if (originalMaterial.map) {
            const sourceTexture = originalMaterial.map;

            let neutralTexture = textureCache.get(
                sourceTexture.uuid
            );

            if (!neutralTexture) {
                neutralTexture =
                    createNeutralFabricTexture(sourceTexture);

                textureCache.set(
                    sourceTexture.uuid,
                    neutralTexture
                );
            }

            material.map = neutralTexture;
        }

        material.color.set(color);
        material.needsUpdate = true;

        materialCache.set(originalMaterial.uuid, material);

        return material;
    }

    model.traverse((object) => {
        if (!object.isMesh || !object.material) {
            return;
        }

        if (Array.isArray(object.material)) {
            object.material = object.material.map(
                recolorMaterial
            );
        } else {
            object.material = recolorMaterial(object.material);
        }
    });
}


// ========================================
// 2. 気球の読み込みと3Dレイヤーの作成
// ========================================

map.on('load', () => {

    const layers = map.getStyle().layers;


    // ------------------------------------
    // 気球から地面までの縦線
    // ------------------------------------

    function createVerticalLine(altitude, size) {
        const points = [
            0, -altitude / size, 0,
            0, 0, 0
        ];

        const geometry = new LineGeometry();
        geometry.setPositions(points);

        const material = new LineMaterial({
            color: 0x000080,
            linewidth: 5
        });

        const line = new Line2(geometry, material);
        line.computeLineDistances();

        return line;
    }


    // ------------------------------------
    // 気球1つ分のカスタムレイヤー
    // ------------------------------------

    function createBalloonLayer(id, origin, altitude, size, color) {

        const modelRotate = [
            Math.PI / 2,
            0,
            0
        ];

        const coord = maplibregl.MercatorCoordinate.fromLngLat(
            origin,
            altitude
        );

        const modelTransform = {
            translateX: coord.x,
            translateY: coord.y,
            translateZ: coord.z,

            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],

            scale: coord.meterInMercatorCoordinateUnits() * size
        };

        const layer = {
            id: id,
            type: 'custom',
            renderingMode: '3d',

            onAdd(map, gl) {
                this.map = map;
                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();

                this.scene.add(
                    createVerticalLine(altitude, size)
                );

                this.scene.add(
                    new THREE.AmbientLight(0xffffff, 2)
                );

                const light = new THREE.DirectionalLight(
                    0xffffff,
                    3
                );

                light.position.set(0, -70, 100).normalize();
                this.scene.add(light);

                const light2 = new THREE.DirectionalLight(
                    0xffffff,
                    1.5
                );

                light2.position.set(0, 70, 100).normalize();
                this.scene.add(light2);

                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                });

                this.renderer.autoClear = false;

                const loader = new GLTFLoader();

                loader.load(
                    './images/hot-air-balloon.glb',

                    (gltf) => {
                        recolorBalloon(gltf.scene, color);

                        this.balloonModel = gltf.scene;
                        this.balloonModel.userData.balloonId = id;

                        this.scene.add(this.balloonModel);

                        this.map.triggerRepaint();
                    },

                    undefined,

                    (error) => {
                        console.error(
                            `気球 ${id} の読み込みに失敗しました:`,
                            error
                        );
                    }
                );
            },

            render(gl, args) {

                const rx = new THREE.Matrix4()
                    .makeRotationAxis(
                        new THREE.Vector3(1, 0, 0),
                        modelTransform.rotateX
                    );

                const ry = new THREE.Matrix4()
                    .makeRotationAxis(
                        new THREE.Vector3(0, 1, 0),
                        modelTransform.rotateY
                    );

                const rz = new THREE.Matrix4()
                    .makeRotationAxis(
                        new THREE.Vector3(0, 0, 1),
                        modelTransform.rotateZ
                    );

                const projection = new THREE.Matrix4()
                    .fromArray(
                        args.defaultProjectionData.mainMatrix
                    );

                const transform = new THREE.Matrix4()
                    .makeTranslation(
                        modelTransform.translateX,
                        modelTransform.translateY,
                        modelTransform.translateZ
                    )
                    .scale(
                        new THREE.Vector3(
                            modelTransform.scale,
                            -modelTransform.scale,
                            modelTransform.scale
                        )
                    )
                    .multiply(rx)
                    .multiply(ry)
                    .multiply(rz);

                this.camera.projectionMatrix =
                    projection.multiply(transform);

                this.renderer.resetState();

                this.renderer.render(
                    this.scene,
                    this.camera
                );
            }
        };

        return layer;
    }


    // ========================================
    // 3. 建物の3Dレイヤー
    // ========================================

    let labelLayerId;

    for (let i = 0; i < layers.length; i++) {
        if (
            layers[i].type === 'symbol' &&
            layers[i].layout?.['text-field']
        ) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    map.addSource('openfreemap', {
        url: 'https://tiles.openfreemap.org/planet',
        type: 'vector'
    });

    const buildingLayer = {
        id: '3d-buildings',
        source: 'openfreemap',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 15,

        filter: [
            '!=',
            ['get', 'hide_3d'],
            true
        ],

        paint: {
            'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'render_height'],
                0, 'lightgray',
                200, 'royalblue',
                400, 'lightblue'
            ],

            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15, 0,
                16, ['get', 'render_height']
            ],

            'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15, 0,
                16, ['get', 'render_min_height']
            ]
        }
    };

    if (labelLayerId) {
        map.addLayer(buildingLayer, labelLayerId);
    } else {
        map.addLayer(buildingLayer);
    }


    // ========================================
    // 4. GeoJSONのデータから気球を追加
    // ========================================

    for (const feature of spots.features) {
        const properties = feature.properties;
        const coordinates = feature.geometry.coordinates;

        const balloonLayer = createBalloonLayer(
            properties.balloonId,
            coordinates,
            properties.altitude,
            properties.size,
            properties.color
        );

        balloonLayers.push(balloonLayer);

        map.addLayer(balloonLayer);
    }


    // ========================================
    // 5. クリック位置に気球があるか調べる
    // ========================================

    function pickBalloon(point) {
        const canvas = map.getCanvas();

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (!width || !height) {
            return null;
        }

        mouse.set(
            (point.x / width) * 2 - 1,
            1 - (point.y / height) * 2
        );

        let selectedLayer = null;
        let selectedDepth = Infinity;

        for (const layer of balloonLayers) {

            if (
                !layer.balloonModel ||
                !layer.camera
            ) {
                continue;
            }

            const projectionMatrix =
                layer.camera.projectionMatrix;

            const inverseProjectionMatrix =
                projectionMatrix.clone().invert();

            const nearPoint = new THREE.Vector3(
                mouse.x,
                mouse.y,
                -1
            ).applyMatrix4(inverseProjectionMatrix);

            const farPoint = new THREE.Vector3(
                mouse.x,
                mouse.y,
                1
            ).applyMatrix4(inverseProjectionMatrix);

            const direction = farPoint
                .clone()
                .sub(nearPoint)
                .normalize();

            raycaster.ray.set(
                nearPoint,
                direction
            );

            raycaster.near = 0;
            raycaster.far = nearPoint.distanceTo(farPoint);

            layer.scene.updateMatrixWorld(true);

            const intersections = raycaster.intersectObject(
                layer.balloonModel,
                true
            );

            if (intersections.length === 0) {
                continue;
            }

            const hit = intersections[0];

            const clipPoint = hit.point
                .clone()
                .applyMatrix4(projectionMatrix);

            const depth = clipPoint.z;

            if (depth < selectedDepth) {
                selectedDepth = depth;
                selectedLayer = layer;
            }
        }

        return selectedLayer;
    }


    // ========================================
    // 6. 気球の上でカーソルを変える
    // ========================================

    map.on('mousemove', (e) => {
        const balloon = pickBalloon(e.point);

        map.getCanvas().style.cursor =
            balloon ? 'pointer' : '';
    });


    // ========================================
    // 7. 気球をクリックしたら観光情報を表示
    // ========================================

    map.on('click', (e) => {

        const balloonLayer = pickBalloon(e.point);

        if (!balloonLayer) {
            if (activePopup) {
                activePopup.remove();
                activePopup = null;
            }

            return;
        }

        const feature = spots.features.find(
            (feature) =>
                feature.properties.balloonId === balloonLayer.id
        );

        if (!feature) {
            console.warn(
                '対応する観光情報が見つかりません:',
                balloonLayer.id
            );
            return;
        }

        const properties = feature.properties;

        if (activePopup) {
            activePopup.remove();
            activePopup = null;
        }

        const html = `
            <div class="tourism-popup">
                <h3>${escapeHtml(properties.name)}</h3>
                <p>${escapeHtml(properties.description)}</p>

                <a
                    href="${escapeHtml(properties.photoPageUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    📷 写真を見る
                </a>
            </div>
        `;

        const popup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: false,
            offset: 18,
            maxWidth: '320px'
        })
            .setLngLat(map.unproject(e.point))
            .setHTML(html);

        popup.on('close', () => {
            if (activePopup === popup) {
                activePopup = null;
            }
        });

        activePopup = popup.addTo(map);

        console.log('クリックした気球:', balloonLayer.id);
        console.log('表示した観光情報:', properties);
    });


    // ========================================
    // 8. ロゴコントロール
    // ========================================

    map.addControl(
        new LogoControl({
            variant: 'com'
        })
    );


    // ========================================
    // 9. 検索画面から渡されたスポットへ地図を移動
    // ========================================

    const searchParams = new URLSearchParams(
        window.location.search
    );

    const targetSpotId = searchParams.get('spot');

    if (targetSpotId) {

        // spots.js 内の id と URL の spot を照合する
        const targetFeature = spots.features.find(
            (feature) =>
                feature.properties.id === targetSpotId
        );

        if (!targetFeature) {

            console.warn(
                '[Search map fly] 該当するスポットが見つかりません:',
                targetSpotId
            );

        } else {

            // 移動先の座標 [経度, 緯度]
            const targetCoordinates =
                targetFeature.geometry.coordinates;

            // 進行中の移動があれば停止する
            map.stop();

            // スポットへ滑らかに移動する
            map.flyTo({
                center: targetCoordinates,
                zoom: 17.5,
                pitch: 60,
                bearing: map.getBearing(),
                speed: 0.8,
                curve: 1.4,
                essential: true
            });

            console.info(
                '[Search map fly] 移動先:',
                targetFeature.properties.name,
                targetCoordinates
            );
        }
    }

});