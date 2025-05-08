export const sadKaomoji = (): string => getRandItem(sad);
export const happyKaomoji = (): string => getRandItem(happy);
export const saluteKaomoji = (): string => getRandItem(salute);
export const shockKaomoji = (): string => getRandItem(shock);

const getRandItem = (arr: string[]): string =>
    arr[Math.floor(Math.random() * arr.length)];

const happy = [
    "(* ^ ω ^)",
    "( ◡‿◡ *)",
    "٩(ˊᗜˋ*)و ♡",
    "ദ്ദി ( ᵔ ᗜ ᵔ )",
    "⸜(｡˃ ᵕ ˂ )⸝♡",
    "(˵ •̀ ᴗ •́ ˵ ) ✧ ",
    "ପ(๑•ᴗ•๑)ଓ♡︎✨",
    "☆ ～('▽^人)",
];

const sad = [
    "(◞‸◟；)",
    "( • ᴖ • ｡)",
    "o(╥﹏╥)o",
    "(´•̥̥̥ω•̥̥̥`)",
    "o(TヘTo)",
    "°՞(ᗒᗣᗕ)՞°",
];

const salute = [
    "(￣^￣)ゞ",
    "(`･ω･´)ゞ",
    "ヽ(•̀ω•́ )ゝ",
    "☆(･ω･*)ゞ",
];

const shock = [
    "Σ(°ロ°)",
    "( ˶°ㅁ°) !!",
    "(」°ロ°)」",
    "(ʘᗩʘ')",
];
