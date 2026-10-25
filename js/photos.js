// ============================================
// ギャラリーに表示する写真データ
// ============================================
// spotId は js/spots.js の properties.id と同じ値にしてください。
//
// 【写真のファイル名ルール】
//   ./images/spot-XX-N.jpg
//     XX = spots.js の id の数字2桁（01〜19）
//     N  = そのスポットの何枚目か（1枚目は必ず 1）
//   例: 佐賀城本丸歴史館の1枚目 → images/spot-01-1.jpg
//       佐賀城本丸歴史館の2枚目 → images/spot-01-2.jpg
//
//   ※ 拡張子は .jpg で統一（.JPG や .jpeg はブラウザ表示は通りますが、
//     大文字小文字の取り違えでリンク切れになるので必ず小文字 .jpg に）。
//   ※ ファイル名に日本語・スペースは使わない（URLエンコード事故を防ぐ）。
//   ※ 1枚あたり 1600px 幅 / 300KB 程度に圧縮するとスマホでも軽い。
//
// 【増やすとき】
//   下のオブジェクトをコピーして id を 'photo-XX-2' などに変えるだけ。
//   id は写真ごとにユニークにしてください。

export const photos = [
    // 01 佐賀県立佐賀城本丸歴史館
    {
        id: 'photo-01-1',
        spotId: 'saga-spot-01',
        src: './images/spot-01-1.jpeg',
        alt: '佐賀県立佐賀城本丸歴史館の外観',
        caption: '幕末維新期の佐賀を伝える歴史館'
    },

    // 02 佐賀バルーンミュージアム
    {
        id: 'photo-02-1',
        spotId: 'saga-spot-02',
        src: './images/spot-02-1.png',
        alt: '佐賀バルーンミュージアムに展示された実物の熱気球',
        caption: '実物バルーンの迫力'
    },

    // 03 GRILL TAKESHITA
    {
        id: 'photo-03-1',
        spotId: 'saga-spot-03',
        src: './images/spot-03-1.jpeg',
        alt: 'GRILL TAKESHITAのランチプレート',
        caption: 'ランチのアイス食べ放題'
    },

    // 04 どんどんどんの森
    {
        id: 'photo-04-1',
        spotId: 'saga-spot-04',
        src: './images/spot-04-1.jpg',
        alt: 'どんどんどんの森の芝生と園路',
        caption: '親子で歩ける広さの市民の森'
    },

    // 05 ドライブイン鳥 佐賀店
    {
        id: 'photo-05-1',
        spotId: 'saga-spot-05',
        src: './images/spot-05-1.jpg',
        alt: 'ドライブイン鳥の鳥めし',
        caption: 'コスパ最強の鳥めし'
    },

    // 06 佐賀牛レストラン 季楽 本店
    {
        id: 'photo-06-1',
        spotId: 'saga-spot-06',
        src: './images/spot-06-1.jpg',
        alt: '季楽本店の佐賀牛ステーキ',
        caption: '佐賀に来たら食べるべし、佐賀牛'
    },

    // 07 SAGAサンライズパーク
    {
        id: 'photo-07-1',
        spotId: 'saga-spot-07',
        src: './images/spot-07-1.jpg',
        alt: 'SAGAサンライズパークの陸上競技場',
        caption: '九州最大級のスポーツ施設'
    },

    // 08 川上峡
    {
        id: 'photo-08-1',
        spotId: 'saga-spot-08',
        src: './images/spot-08-1.jpeg',
        alt: '川上峡の空を泳ぐ鯉のぼり',
        caption: '春は約300匹の鯉のぼり'
    },

    // 09 佐賀県庁
    {
        id: 'photo-09-1',
        spotId: 'saga-spot-09',
        src: './images/spot-09-1.jpeg',
        alt: '佐賀県庁',
        caption: '屋上には展望ホールがあり佐賀市を一望できます'
    },

    // 10 神野公園こども遊園地
    {
        id: 'photo-10-1',
        spotId: 'saga-spot-10',
        src: './images/spot-10-1.jpg',
        alt: '神野公園こども遊園地のアトラクション',
        caption: '小さな子でも安心の遊園地'
    },

    // 11 ほげ
    {
        id: 'photo-11-1',
        spotId: 'saga-spot-11',
        src: './images/spot-11-1.webp',
        alt: 'ほげの揚げたて天ぷら',
        caption: '佐賀駅徒歩5分、平日だけの天ぷら屋'
    },

    // 12 ゆめタウン佐賀
    {
        id: 'photo-12-1',
        spotId: 'saga-spot-12',
        src: './images/spot-12-1.jpg',
        alt: 'ゆめタウン佐賀の売り場のようす',
        caption: '佐賀市民の御用達スポット'
    }
];