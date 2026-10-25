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
// 2. クリック判定用の共通変数
// ========================================

// 追加した気球レイヤーを保存する
const balloonLayers = [];

// 3Dモデルとの交差判定に使う
const raycaster = new THREE.Raycaster();

// マウスの位置を画面座標から変換して保存する
const mouse = new THREE.Vector2();

// 現在表示しているポップアップ
let activePopup = null;


// HTMLに表示する文字列を安全に変換する
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


// 地図が動き始めたら、クリック位置に表示したポップアップを閉じる
// 3D気球の位置とポップアップがずれていくのを防ぐ
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

    // 画像を取得できなければ元のテクスチャを使う
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

    // 元画像の平均的な明るさを求める
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

    // 色味を取り除き、明暗の模様を残す
    for (let i = 0; i < data.length; i += 4) {
        const luminance =
            0.2126 * data[i] +
            0.7152 * data[i + 1] +
            0.0722 * data[i + 2];

        // 元の色ではなく、布の凹凸・明暗を残す
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
        // data[i + 3] の透明度は変更しない
    }

    context.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);

    // 元のテクスチャ設定を引き継ぐ
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
    // 同じ素材は何度も複製・変換しない
    const materialCache = new Map();
    const textureCache = new Map();

    function recolorMaterial(originalMaterial) {
        if (!originalMaterial) {
            return originalMaterial;
        }

        const name = originalMaterial.name || '';

        // 気球の外袋の布素材だけを対象にする
        const isBalloonFabric =
            /balloon fabric|sailcloth/i.test(name);

        // カゴ・ロープ・金属などは変更しない
        if (!isBalloonFabric) {
            return originalMaterial;
        }

        if (materialCache.has(originalMaterial.uuid)) {
            return materialCache.get(originalMaterial.uuid);
        }

        // 元の素材を複製して、モデルの元データを保護
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

        // spots で指定した色を適用
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
            object.material = recolorMaterial(
                object.material
            );
        }
    });
}


// ========================================
// 3. 気球の読み込みと3Dレイヤーの作成
// ========================================

map.on('load', () => {

    const layers = map.getStyle().layers;


    // ------------------------------------
    // 気球から地面までの縦線を作る
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
    // 気球1つ分のカスタムレイヤーを作る
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

        // 元の return { ... } を layer 変数に変更
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
    // 気球の外袋に spots で指定された色を適用
    recolorBalloon(gltf.scene, color);

    // クリック判定に使うモデルも保存
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
    // 4. 建物の3Dレイヤーを作る
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
    // 5. GeoJSONのデータから気球を追加
    // ========================================

for (const feature of spots.features) {
    const properties = feature.properties;
    const coordinates = feature.geometry.coordinates;

    const balloonLayer = createBalloonLayer(
        properties.balloonId,
        coordinates,
        properties.altitude,
        properties.size,
        properties.color // 気球の色を追加
    );

    // クリック判定用の配列に保存（必要！）
    balloonLayers.push(balloonLayer);

    // 地図に気球を追加
    map.addLayer(balloonLayer);
}

    // ========================================
    // 6. クリック位置に気球があるか調べる
    // ========================================

    function pickBalloon(point) {
        const canvas = map.getCanvas();

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (!width || !height) {
            return null;
        }

        // MapLibreの画面座標をThree.jsのNDC座標に変換
        // x: -1 ～ +1
        // y: -1 ～ +1（上下方向を反転）
        mouse.set(
            (point.x / width) * 2 - 1,
            1 - (point.y / height) * 2
        );

        let selectedLayer = null;
        let selectedDepth = Infinity;

        for (const layer of balloonLayers) {

            // 3Dモデルの読み込みが終わる前は判定しない
            if (
                !layer.balloonModel ||
                !layer.camera
            ) {
                continue;
            }

            // この気球の描画に使った変換行列。
            // 通常のカメラの投影行列とは異なり、
            // 地図上の位置・高度・サイズの変換も含んでいる。
            const projectionMatrix =
                layer.camera.projectionMatrix;

            // 画面座標から気球のローカル座標へ戻す
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

            // 画面を貫くレイを作成する
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

            // モデルの位置情報を最新にする
            layer.scene.updateMatrixWorld(true);

            // 縦線ではなく、気球の3Dモデルのみを判定
            const intersections = raycaster.intersectObject(
                layer.balloonModel,
                true
            );

            if (intersections.length === 0) {
                continue;
            }

            // 複数の気球に当たったときは、
            // 画面上で手前にある気球を優先する
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
    // 7. 気球の上でカーソルを変える
    // ========================================

    map.on('mousemove', (e) => {
        const balloon = pickBalloon(e.point);

        map.getCanvas().style.cursor =
            balloon ? 'pointer' : '';
    });


    // ========================================
    // 8. 実際の気球をクリックしたら情報を表示
    // ========================================

    map.on('click', (e) => {

        // クリック位置と交差した3D気球を取得
        const balloonLayer = pickBalloon(e.point);

        // 気球がクリックされていなければポップアップを閉じる
        if (!balloonLayer) {
            if (activePopup) {
                activePopup.remove();
                activePopup = null;
            }

            return;
        }

        // クリックされた気球のIDを使って観光情報を検索
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

        // 以前のポップアップがあれば閉じる
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

        // クリックした画面位置の近くに情報を表示する
        // 地図を動かしたときは、位置がずれないように閉じる
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
    // 9. ロゴコントロール
    // ========================================

    map.addControl(
        new LogoControl({
            variant: 'com'
        })
    );

    
});