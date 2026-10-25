// ============================================
// 佐賀市スポットデータ（さがばいマップ用）
// ============================================
// 出典: さがばいマップ - 無題のレイヤ.csv（WKT / 名前 / 説明）
// 座標は CSV の POINT(経度 緯度) をそのまま [経度, 緯度] に変換。
//
// altitude = 気球の高度(m)
//   人気度 popularity(0-100) から算出:
//   altitude = 40 + popularity * 2.2  → 5m 単位に丸め
//   （人気 0 → 40m / 人気 100 → 260m。人気があるほど高く浮く）
//
// size     = 気球モデルの大きさ（3 で統一）
// color    = スライドのキーカラー #E85A4F / #E9B949 / #C39426 を軸にした配色
//   食(U+E85A4F) 自然(#4E9A6B) 歴史・文化(#C39426)
//   公共・スポーツ(#2A6E8F) 買い物(#E9B949) 恵比須(#8C8577)

export const spots = {
    type: 'FeatureCollection',
    features: [
        // ----------------------------------------
        // 01 佐賀県立佐賀城本丸歴史館
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-01',
                balloonId: 'balloon-01',
                name: '佐賀県立佐賀城本丸歴史館',
                description: '日本近代化に貢献した「幕末維新期の佐賀」を展示物と共に楽しんだり、学ぶことができる場所です。',
                category: '歴史・文化',
                popularity: 88,          // 2004年開館、2024年に累計来館者400万人
                altitude: 235,
                size: 3,
                color: '#C39426',        // ゴールド
                photoPageUrl: './gallery.html?spot=saga-spot-01'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.3028391, 33.2456131]
            }
        },

        // ----------------------------------------
        // 02 佐賀バルーンミュージアム
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-02',
                balloonId: 'balloon-02',
                name: '佐賀バルーンミュージアム',
                description: '実際のバルーンが展示してあり、迫力満点です。バルーンフェスティバルに行きたくなります！',
                category: '体験・公共',
                popularity: 20,          // 常設館単体の入館者は少なめ。祭本体は年80万人
                altitude: 85,
                size: 3,
                color: '#2A6E8F',        // 藍
                photoPageUrl: './gallery.html?spot=saga-spot-02'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.3004143, 33.2524136]
            }
        },

        // ----------------------------------------
        // 03 GRILL TAKESHITA
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-03',
                balloonId: 'balloon-03',
                name: 'GRILL TAKESHITA',
                description: '洋風レストランです。ランチタイムにメイン料理を注文するとアイス食べ放題を楽しむことができます。',
                category: '食',
                popularity: 12,          // 個人店。地元リピーター中心
                altitude: 65,
                size: 3,
                color: '#E85A4F',        // コーラル
                photoPageUrl: './gallery.html?spot=saga-spot-03'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.2996728, 33.2630899]
            }
        },

        // ----------------------------------------
        // 04 どんどんどんの森
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-04',
                balloonId: 'balloon-04',
                name: 'どんどんどんの森',
                description: '地域住民の憩いの場！小学生の旅行が学校にやって来て、図書館の近所が自然！小学生が気軽にお散歩って楽しめる広さなので、親子で来てもオススメです！',
                category: '自然・公園',
                popularity: 25,          // 日常利用の公園。観光客は少ない
                altitude: 95,
                size: 3,
                color: '#4E9A6B',        // グリーン
                photoPageUrl: './gallery.html?spot=saga-spot-04'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.2911189, 33.2604742]
            }
        },

        // ----------------------------------------
        // 05 ドライブイン鳥 佐賀店
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-05',
                balloonId: 'balloon-05',
                name: 'ドライブイン鳥 佐賀店',
                description: '鶏の身が大きくて新鮮で美味しいです！大人気の鳥めしもリーズナブルに食べれるので、コスパ最強！',
                category: '食',
                popularity: 30,          // 県内屈指の行列店
                altitude: 105,
                size: 3,
                color: '#E85A4F',
                photoPageUrl: './gallery.html?spot=saga-spot-05'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.3013241, 33.2652933]
            }
        },

        // ----------------------------------------
        // 06 佐賀牛レストラン 季楽 本店
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-06',
                balloonId: 'balloon-06',
                name: '佐賀牛レストラン 季楽 本店',
                description: '佐賀牛といえばココ！絶品の佐賀牛が味わえます！お値段は高いですが、佐賀に来たら食べるべし！',
                category: '食',
                popularity: 22,          // 客単価が高く回転は少ないが知名度は高い
                altitude: 90,
                size: 3,
                color: '#E85A4F',
                photoPageUrl: './gallery.html?spot=saga-spot-06'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.3033185, 33.2615773]
            }
        },

        // ----------------------------------------
        // 07 SAGAサンライズパーク
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-07',
                balloonId: 'balloon-07',
                name: 'SAGAサンライズパーク',
                description: '2023年に新しくできた、九州最大級のスポーツ施設！陸上競技場に体育館、プールもあり、国スポも行われました！水泳競技場のSAGA AQUAはとても新しく泳ぎやすいので泳ぐのが好きな方はぜひ！また、ウォーキングにも最適です！',
                category: '公共・スポーツ',
                popularity: 85,          // 総合運動場 年約44万人 + SAGAアリーナ開業半年で26万人
                altitude: 225,
                size: 3,
                color: '#2A6E8F',
                photoPageUrl: './gallery.html?spot=saga-spot-07'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.2903135, 33.2764654]
            }
        },

        // ----------------------------------------
        // 08 川上峡
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-08',
                balloonId: 'balloon-08',
                name: '川上峡',
                description: '元佐賀市民おすすめスポット！春の季節には約300匹の鯉のぼりが空を泳ぎます！迫力満点でカワイイ！',
                category: '自然・公園',
                popularity: 30,          // 春の鯉のぼり時期に集中
                altitude: 105,
                size: 3,
                color: '#4E9A6B',
                photoPageUrl: './gallery.html?spot=saga-spot-08'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.2688417, 33.3268154]
            }
        },

        // ----------------------------------------
        // 09 佐賀県庁（屋上展望）
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-09',
                balloonId: 'balloon-09',
                name: '佐賀県庁',
                description: '屋上から見える360度の佐賀の景色は佐賀の自然や建物を楽しみながら知ることができます。360度の佐賀市の景色を見れる場所はこの場所くらいしかないため、佐賀市にいって絶景スポットを見るべし！',
                category: '公共・スポーツ',
                popularity: 35,          // 無料の展望スポット。県民の利用が中心
                altitude: 115,
                size: 3,
                color: '#2A6E8F',
                photoPageUrl: './gallery.html?spot=saga-spot-09'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.2988042, 33.2494385]
            }
        },

        // ----------------------------------------
        // 10 神野公園こども遊園地
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-10',
                balloonId: 'balloon-10',
                name: '神野公園こども遊園地',
                description: '小さい子供向けの、遊園地です。いろいろなアトラクションがあり、高さ等も少ないため、安全に楽しむことができます！',
                category: '自然・公園',
                popularity: 40,          // 家族連れの定番。休日は賑わう
                altitude: 130,
                size: 3,
                color: '#4E9A6B',
                photoPageUrl: './gallery.html?spot=saga-spot-10'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.2817051, 33.2650688]
            }
        },

        // ----------------------------------------
        // 11 ほげ（駅近の天ぷら屋）
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-11',
                balloonId: 'balloon-11',
                name: 'ほげ',
                description: '元佐賀市民激推し！佐賀駅徒歩5分圏内の駅近天ぷら屋です。基本平日しかやっていないですが、揚げたて天ぷらが提供され、値段も良心的なので行くしかない！！どれもサクサクで美味しいです！',
                category: '食',
                popularity: 8,           // 平日昼のみ営業の隠れ家。ここが「地元だけが知る」枠
                altitude: 60,
                size: 3,
                color: '#E85A4F',
                photoPageUrl: './gallery.html?spot=saga-spot-11'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.2975046, 33.2618412]
            }
        },

        // ----------------------------------------
        // 12 ゆめタウン佐賀
        // ----------------------------------------
        {
            type: 'Feature',
            properties: {
                id: 'saga-spot-12',
                balloonId: 'balloon-12',
                name: 'ゆめタウン佐賀',
                description: '「佐賀市民の買い物」といえばココ。食品や雑貨等全てが揃っている、佐賀市民の御用達スポットであり、救世主です！',
                category: '買い物',
                popularity: 55,          // 佐賀市最大級の商業施設。日常利用が非常に多い
                altitude: 160,
                size: 3,
                color: '#E9B949',        // イエローゴールド
                photoPageUrl: './gallery.html?spot=saga-spot-12'
            },
            geometry: {
                type: 'Point',
                coordinates: [130.3081512, 33.2752779]
            }
        }
    ]
};