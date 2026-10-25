// 観光スポットのデータを読み込む
import { spots } from './spots.js';

const form = document.getElementById('search-form');
const input = document.getElementById('spot-search-input');
const results = document.getElementById('spot-search-results');

// 検索結果や案内メッセージを表示する
function showMessage(message) {
    const paragraph = document.createElement('p');

    paragraph.className = 'search-message';
    paragraph.textContent = message;

    results.replaceChildren(paragraph);
}

// 名前と説明を検索する
function searchSpots() {
    const query = input.value.trim().toLocaleLowerCase('ja');

    // 前回の検索結果を消す
    results.replaceChildren();

    if (!query) {
        showMessage('スポット名や説明を入力してください。');
        return;
    }

    // 空白で複数のキーワードに分割する
    const keywords = query.split(/\s+/);

    // スポット名・説明の両方を検索対象にする
    const matchedSpots = spots.features.filter((feature) => {
        const properties = feature.properties;

        const searchableText = (
            `${properties.name ?? ''} ${properties.description ?? ''}`
        ).toLocaleLowerCase('ja');

        // すべてのキーワードを含むスポットを探す
        return keywords.every((keyword) =>
            searchableText.includes(keyword)
        );
    });

    // 該当するスポットがない場合
    if (matchedSpots.length === 0) {
        showMessage(
            '該当する観光スポットが見つかりませんでした。'
        );
        return;
    }

    // 検索結果の件数
    const count = document.createElement('p');

    count.className = 'search-result-count';
    count.textContent =
        `${matchedSpots.length} 件のスポットが見つかりました。`;

    results.append(count);

    // 各スポットの検索結果を作る
    for (const feature of matchedSpots) {
        const properties = feature.properties;

        const article = document.createElement('article');
        article.className = 'spot-search-result';

        const title = document.createElement('h3');
        title.textContent = properties.name || '名称未設定';

        const description = document.createElement('p');
        description.textContent =
            properties.description || '説明はありません。';

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = '地図で見る';

        // この結果に対応する座標へ移動する
        button.addEventListener('click', () => {
            const spotId = properties.id;

            window.location.href =
                `index.html?spot=${encodeURIComponent(spotId)}`;
        });

        article.append(title, description, button);
        results.append(article);
    }
}

// フォーム送信時に検索する
form.addEventListener('submit', (event) => {
    event.preventDefault();
    searchSpots();
});

// 入力中にも検索結果を更新する
input.addEventListener('input', searchSpots);

// 初期メッセージ
showMessage('スポット名や説明から検索できます。');
