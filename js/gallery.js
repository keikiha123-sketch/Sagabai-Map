// ============================================
// 写真ギャラリー
// ============================================
import { spots } from './spots.js';
import { photos } from './photos.js';

const spotFilter = document.getElementById('spot-filter');
const galleryStatus = document.getElementById('gallery-status');
const photoGrid = document.getElementById('photo-grid');
const galleryEmpty = document.getElementById('gallery-empty');

const photoDialog = document.getElementById('photo-dialog');
const photoDialogImage = document.getElementById('photo-dialog-image');
const photoDialogSpot = document.getElementById('photo-dialog-spot');
const photoDialogCaption = document.getElementById('photo-dialog-caption');
const photoDialogClose = document.getElementById('photo-dialog-close');

// HTML側の要素が不足しているときは、エラーの発生場所を分かりやすくする。
const requiredElements = [
    spotFilter,
    galleryStatus,
    photoGrid,
    galleryEmpty,
    photoDialog,
    photoDialogImage,
    photoDialogSpot,
    photoDialogCaption,
    photoDialogClose
];

if (requiredElements.some((element) => !element)) {
    throw new Error(
        'ギャラリーに必要なHTML要素が見つかりません。gallery.htmlを確認してください。'
    );
}

// --------------------------------------------
// 1. スポット選択欄を作る
// --------------------------------------------
for (const feature of spots.features) {
    const properties = feature.properties;
    const option = document.createElement('option');

    option.value = properties.id;
    option.textContent = properties.name || '名称未設定のスポット';

    spotFilter.append(option);
}

// URLの ?spot=saga-spot-1 を読み取る。
// スポットIDが存在するときだけ、そのスポットを初期選択する。
const url = new URL(window.location.href);
const requestedSpotId = url.searchParams.get('spot');

const knownSpotIds = new Set(
    spots.features.map((feature) => feature.properties.id)
);

const initialSpotId =
    requestedSpotId && knownSpotIds.has(requestedSpotId)
        ? requestedSpotId
        : 'all';

spotFilter.value = initialSpotId;

// --------------------------------------------
// 2. スポットIDからスポット名を取得する
// --------------------------------------------
function getSpotName(spotId) {
    const feature = spots.features.find(
        (item) => item.properties.id === spotId
    );

    return feature?.properties.name || 'スポット未設定';
}

// --------------------------------------------
// 3. 写真を1枚ずつタイルとして作る
// --------------------------------------------
function createPhotoTile(photo) {
    const spotName = getSpotName(photo.spotId);
    const caption = photo.caption || 'キャプションはありません。';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-tile';

    button.setAttribute(
        'aria-label',
        `写真の詳細を表示：${spotName}、${caption}`
    );

    const image = document.createElement('img');

    image.src = photo.src;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';

    // パスが間違っている場合、クリックできないタイルにする。
    image.addEventListener('error', () => {
        button.disabled = true;
        button.classList.add('photo-tile--error');
        button.replaceChildren();

        const message = document.createElement('span');
        message.className = 'photo-tile__error-message';
        message.textContent = '画像を読み込めませんでした';

        button.append(message);
    }, { once: true });

    button.append(image);

    button.addEventListener('click', () => {
        openPhoto(photo);
    });

    return button;
}

// --------------------------------------------
// 4. 選択中のスポットに合わせて一覧を更新する
// --------------------------------------------
function renderGallery() {
    const selectedSpotId = spotFilter.value;

    const visiblePhotos = selectedSpotId === 'all'
        ? photos
        : photos.filter((photo) => photo.spotId === selectedSpotId);

    photoGrid.replaceChildren();

    galleryStatus.textContent = `${visiblePhotos.length} 枚の写真`;

    if (visiblePhotos.length === 0) {
        galleryEmpty.textContent = selectedSpotId === 'all'
            ? '写真はまだ登録されていません。'
            : 'このスポットの写真はまだ登録されていません。';

        galleryEmpty.hidden = false;
        return;
    }

    galleryEmpty.hidden = true;

    const fragment = document.createDocumentFragment();

    for (const photo of visiblePhotos) {
        fragment.append(createPhotoTile(photo));
    }

    photoGrid.append(fragment);
}

// --------------------------------------------
// 5. 写真をクリックしたときに詳細を表示する
// --------------------------------------------
function openPhoto(photo) {
    photoDialogImage.src = photo.src;

    photoDialogImage.alt =
        photo.alt || photo.caption || 'ギャラリーの写真';

    photoDialogSpot.textContent = getSpotName(photo.spotId);

    photoDialogCaption.textContent =
        photo.caption || 'キャプションはありません。';

    if (!photoDialog.open) {
        photoDialog.showModal();
    }
}

function closePhoto() {
    if (photoDialog.open) {
        photoDialog.close();
    }
}

photoDialogClose.addEventListener('click', closePhoto);

// ダイアログの写真・説明以外の暗い背景をクリックすると閉じる。
photoDialog.addEventListener('click', (event) => {
    if (event.target === photoDialog) {
        closePhoto();
    }
});

// --------------------------------------------
// 6. 絞り込みを変えたら一覧とURLを更新する
// --------------------------------------------
spotFilter.addEventListener('change', () => {
    const nextUrl = new URL(window.location.href);

    if (spotFilter.value === 'all') {
        nextUrl.searchParams.delete('spot');
    } else {
        nextUrl.searchParams.set('spot', spotFilter.value);
    }

    // ページを再読み込みせず、選択状態をURLに反映する。
    window.history.replaceState({}, '', nextUrl);

    renderGallery();
});

// 初回表示。URLにスポットIDがあれば、その写真だけを表示する。
renderGallery();