# Lumenia Planet Museum の紹介映像

15人の人物が登場する、音声付きの15秒の紹介映像です。MuseumのCSSで描いた人物と動きをHyperFramesで映像にし、HeyGenの標準音声で案内しています。

人物、衣服、部屋、台詞は資料から着想したMuseumの創作です。本人の映像や発言の再現ではありません。音声は人物の声を複製したものではありません。

完成映像は `renders/lumenia-museum-characters.mp4`、確認記録は `verification.json` にあります。Museum本体に使う人物の定義は `web/artwork/css-museum-people.mjs`、描画は `web/components/CssArtistCharacter.tsx` と `web/components/CssMuseumCharacter.tsx` です。この映像は、それらから得たCSSの独立した収録用画面です。

`npm run check` で構成を検査し、`npm run render -- --output renders/lumenia-museum-characters.mp4 --fps 24 --workers 1 --quality standard` で書き出します。再生成には日本語フォントとGSAPの読み込みが必要です。

参考となる一次資料は [Victoria and Albert Museum](https://www.vam.ac.uk/articles/willam-morris-textiles) と [Eames Foundation](https://eamesfoundation.org/charles-ray/biography/) です。15人それぞれの資料への対応は `verification/people-research.json` に記録しています。
