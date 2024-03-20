var imgFileNames = [
    'lane_bot',
    'lane_jungle',
    'lane_mid',
    'lane_support',
    'lane_top',
    'lane_any',

    'tier_unranked',
    'tier_iron',
    'tier_bronze',
    'tier_silver',
    'tier_gold',
    'tier_platinum',
    'tier_emerald',
    'tier_diamond',
    'tier_master',
    'tier_grandmaster',
    'tier_challenger'
];
var localImages = {};

async function storeImages() {
    var responses = await Promise.all(
        imgFileNames.map(async (f) => {
            var url = fileUrl + `${f.split('_')[0]}/${f.split('_')[1]}.png/`
            var response = await requestGet(url);
            var result = await response.blob();
            localImages[f] = URL.createObjectURL(result);
            return result;
        })
    );
};

