// /**
//  * 金額格式化參數
//  * @param hideDecimalsAbovePowerOfTen 大於10的n次方時隱藏小數位數
//  * @param showAbbreviation ture會辨識幣別規則顯示km縮寫,false則不管幣值都顯示原本的人民幣的數字,預設為true
//  * @param padZeros 小數點後是否要補0到小數第二位,預設為false
//  * @param showAbbreviationCNY 人民幣顯示KM縮寫,預設為false
//  * @param showThousandSeparator 是否要顯示千分位,預設為true
//  * @param isFloor 小數位數,無條件捨去,預設為false
//  * @param otherAbbreviation 例外縮寫規則,fastgame 數字鍵盤使用
//  * @param onlyKAbbreviation 是否只顯示K縮寫,K以上縮寫不顯示,預設為false
//  */
// export type TFormatCurrencyParamType = {
//     //大於10的n次方時小數值為0的時候,隱藏小數位數,此數字為/100前數字位數,
//     //ex,要100以上不顯示小數請設定4,預設為0不隱藏,此參數只有在小數位數為0時才有作用,
//     //且優先於padZeros設定
//     hideDecimalsAbovePowerOfTen?: number;
//     //ture會辨識幣別規則顯示km縮寫,人民幣不顯示km,false則不管幣別都不使用縮寫,預設為true
//     showAbbreviation?: boolean;
//     //小數點後是否要補0到小數第二位,預設為false
//     padZeros?: boolean;
//     //人民幣顯示KM縮寫,預設為false
//     showAbbreviationCNY?: boolean;
//     //是否要顯示千分位,預設為true
//     showThousandSeparator?: boolean;
//     //小數位數,無條件捨去,預設為false
//     isFloor?: boolean;
//     //例外縮寫規則,fastgame 數字鍵盤使用
//     otherAbbreviation?: boolean;
//     //是否只顯示K縮寫,K以上縮寫不顯示,預設為false
//     onlyKAbbreviation?: boolean;
// };

// export class i18n {
//     /**
//      * 金幣幣別符號取得
//      * e.x. CurrencyType[GlobalHandle.accountInfo.ccy] 可以取得當前幣別的符號字串
//      */
//     public static CurrencyType = CurrencyGoldType;

//     /**
//      * 格式化金額字串
//      * @param {string} score - 金額
//      * @param {TFormatCurrencyParamType} formatCurrencyParam - 金額格式化參數
//      * @returns 轉換後的數字字串
//      */
//     public static formatCurrencyStr(score: string, formatCurrencyParam?: TFormatCurrencyParamType): string {
//         let curFormatCurrencyParam = {
//             //大於10的n次方時隱藏小數位數,預設為0不隱藏
//             hideDecimalsAbovePowerOfTen: 0,
//             //ture會辨識幣別規則顯示km縮寫,false則不管幣值都顯示原本的人民幣的數字
//             showAbbreviation: true,
//             //小數點後是否要補0到小數第二位
//             padZeros: false,
//             //人民幣顯示KM縮寫
//             showAbbreviationCNY: false,
//             //是否要顯示千分位
//             showThousandSeparator: true,
//             //例外縮寫規則,fastgame 數字鍵盤使用
//             otherAbbreviation: false,
//             //小數位數,無條件捨去
//             isFloor: false,
//             //是否只顯示K縮寫
//             onlyKAbbreviation: false,
//         };
//         curFormatCurrencyParam = { ...curFormatCurrencyParam, ...formatCurrencyParam };
//         let {
//             hideDecimalsAbovePowerOfTen,
//             showAbbreviation,
//             padZeros,
//             showAbbreviationCNY,
//             showThousandSeparator,
//             otherAbbreviation,
//             isFloor,
//             onlyKAbbreviation,
//         } = curFormatCurrencyParam;
//         //根據幣別顯示不同的格式
//         switch (GlobalHandle.accountInfo.ccy) {
//             case 'CNY':
//                 //人民幣顯示KM縮寫
//                 if (showAbbreviationCNY)
//                     return this.transCoinAbbreviation(
//                         score,
//                         'CNY',
//                         2,
//                         showThousandSeparator,
//                         otherAbbreviation,
//                         onlyKAbbreviation,
//                         padZeros
//                     );
//                 return this.showDecimalPlaces(
//                     score,
//                     2,
//                     hideDecimalsAbovePowerOfTen,
//                     padZeros,
//                     'CNY',
//                     showThousandSeparator,
//                     isFloor
//                 );
//             case 'IDR':
//                 //印尼盾不顯示KM縮寫
//                 if (!showAbbreviation)
//                     return this.showDecimalPlaces(
//                         score,
//                         0,
//                         hideDecimalsAbovePowerOfTen,
//                         padZeros,
//                         'IDR',
//                         showThousandSeparator,
//                         isFloor
//                     );
//                 return this.transCoinAbbreviation(
//                     score,
//                     'IDR',
//                     0,
//                     showThousandSeparator,
//                     otherAbbreviation,
//                     onlyKAbbreviation,
//                     padZeros
//                 );
//             default:
//                 return this.showDecimalPlaces(
//                     score,
//                     2,
//                     hideDecimalsAbovePowerOfTen,
//                     padZeros,
//                     'OTHER',
//                     showThousandSeparator,
//                     isFloor
//                 );
//         }
//     }

//     /**
//      * 輸入簡中國家名稱取得對應翻譯的國家名稱
//      * @param {string} country 簡中國家名稱
//      * @returns 對應國家名稱
//      */
//     public static getCountryString(country: string | undefined): string {
//         //當簡中語言時直接回傳當前地名,不進行轉換
//         if (LanguageManager.Ins.CurrentLanguage === LanguageType.CN) return country!;
//         if (!country) return getLanguageBaseTable('CBase_785');
//         let countryId = getCountryId(country);
//         return getLanguageBaseTable(countryId);
//     }

//     /**
//      * 還原金額字串 (注意！原本被省略的數字不會被還原)
//      * @param {string} score - 金額
//      * @returns 轉換後的數字字串
//      */
//     public static revertCurrencyStr(score: string, isSeverScore = true): string {
//         let decimalPoint = '.';
//         let thousandSeparator = ',';
//         // 印尼文小數點為逗號
//         if (LanguageManager.Ins.CurrentLanguage === LanguageType.ID) {
//             decimalPoint = ',';
//             thousandSeparator = '\\.';
//         }
//         // 移除千分位
//         score = score.replace(new RegExp(thousandSeparator, 'g'), '');
//         // 還原小數點
//         score = score.replace(decimalPoint, '.');
//         // 還原KMB
//         score = this.convertSuffixToNumber(score);
//         // 轉換為伺服器格式
//         if (isSeverScore) score = this.getServerNumberFormat(score);

//         return score;
//     }

//     /**
//      * 還原KMB縮寫
//      * @param {string} score - 金額
//      * @returns 轉換後的數字字串
//      */
//     public static convertSuffixToNumber(score: string): string {
//         return score.replace(/(\d+(\.\d+)?)([KMB])/gi, (match: string, number: string, _: string, suffix: string) => {
//             const multipliers: { [key: string]: number } = { K: 1e3, M: 1e6, B: 1e9 };
//             const multiplier = multipliers[suffix.toUpperCase()]; // 根据后缀获取倍数
//             return (parseFloat(number) * multiplier).toString();
//         });
//     }

//     /**
//      * 轉換金額字串為伺服器格式
//      * @param {string} numStr - 要轉換的數字字串
//      * @returns 轉換後的數字字串
//      */
//     public static getServerNumberFormat(numStr: string): string {
//         switch (GlobalHandle.accountInfo.ccy) {
//             case 'IDR':
//                 return numStr;
//             default:
//                 // 檢查是否為有效的數字字串
//                 if (isNaN(Number(numStr))) {
//                     throw new Error('Invalid number string');
//                 }

//                 // 將字串轉換為數字
//                 let num = (parseFloat(numStr) * 100).toFixed(0);

//                 return num;
//         }
//     }

//     /**
//      * 比較兩個字串表示的數字的大小
//      * @param {string} numStr1 - 字串表示的第一個數字
//      * @param {string} numStr2 - 字串表示的第二個數字
//      * @returns -1 如果 numStr1 < numStr2，0 如果 numStr1 == numStr2，1 如果 numStr1 > numStr2
//      */
//     public static compareStringNumbers(numStr1: string, numStr2: string): number {
//         // 將字串轉換為 JSBI.BigInt 進行比較，避免精度損失
//         const bigInt1 = JSBI.BigInt(numStr1.toString());
//         const bigInt2 = JSBI.BigInt(numStr2.toString());

//         if (JSBI.lessThan(bigInt1, bigInt2)) {
//             return -1;
//         } else if (JSBI.greaterThan(bigInt1, bigInt2)) {
//             return 1;
//         } else {
//             return 0;
//         }
//     }

//     /**
//      * 確認字串表示的數字是否小於 0
//      * @param {string} numStr - 字串表示的數字
//      * @returns true 如果數字小於 0，否則 false
//      */
//     public static isStringNumberNegative(numStr: string): boolean {
//         try {
//             // 將字串轉換為 JSBI.BigInt 進行比較，避免精度損失
//             const bigIntValue = JSBI.BigInt(numStr);
//             return JSBI.lessThan(bigIntValue, JSBI.BigInt(0));
//         } catch (error) {
//             console.error('Invalid number string:', error);
//             return false;
//         }
//     }

//     /**
//      * 確認字串表示的數字是否大於等於 0
//      * @param {string} numStr - 字串表示的數字
//      * @returns true 如果數字大於等於 0，否則 false
//      */
//     public static isStringNumberNonNegative(numStr: string): boolean {
//         try {
//             // 將字串轉換為 JSBI.BigInt 進行比較，避免精度損失
//             const bigIntValue = JSBI.BigInt(numStr);
//             return JSBI.greaterThanOrEqual(bigIntValue, JSBI.BigInt(0));
//         } catch (error) {
//             console.error('Invalid number string:', error);
//             return false;
//         }
//     }

//     /**
//      * 確認字串表示的數字是否大於 0
//      * @param {string} numStr - 字串表示的數字
//      * @returns true 如果數字大於 0，否則 false
//      */
//     public static checkPositive(numStr: string): boolean {
//         try {
//             // 將字串轉換為 JSBI.BigInt 進行比較，避免精度損失
//             const bigIntValue = JSBI.BigInt(numStr);
//             return JSBI.greaterThan(bigIntValue, JSBI.BigInt(0));
//         } catch (error) {
//             console.error('Invalid number string:', error);
//             return false;
//         }
//     }

//     /**
//      * 計算兩個字串表示的數字的餘數
//      * @param {string} numStr1 - 字串表示的第一個數字
//      * @param {string} numStr2 - 字串表示的第二個數字
//      * @returns 餘數的字串表示
//      */
//     public static remainderStringNumbers(numStr1: string, numStr2: string): string {
//         try {
//             // 將字串轉換為 JSBI.BigInt 進行計算，避免精度損失
//             const bigInt1 = JSBI.BigInt(numStr1);
//             const bigInt2 = JSBI.BigInt(numStr2);

//             if (JSBI.equal(bigInt2, JSBI.BigInt(0))) {
//                 throw new Error('Division by zero');
//             }

//             const remainder = JSBI.remainder(bigInt1, bigInt2); // JSBI.toNumber(bigInt1) % JSBI.toNumber(bigInt2);
//             return remainder.toString();
//         } catch (error) {
//             console.error('Invalid number string:', error);
//             return 'NaN';
//         }
//     }

//     /**
//      * 將兩個字串表示的數字相加
//      * @param {string} numStr1 - 字串表示的第一個數字
//      * @param {string} numStr2 - 字串表示的第二個數字
//      * @returns 相加後的結果字串
//      */
//     public static addStringNumbers(numStr1: string, numStr2: string): string {
//         // 將字串轉換為 JSBI.BigInt 進行相加，避免精度損失
//         const bigInt1 = JSBI.BigInt(numStr1);
//         const bigInt2 = JSBI.BigInt(numStr2);

//         const sum = JSBI.add(bigInt1, bigInt2);
//         return sum.toString();
//     }

//     /**
//      * 將兩個字串表示的數字相減
//      * @param {string} numStr1 - 字串表示的第一個數字
//      * @param {string} numStr2 - 字串表示的第二個數字
//      * @returns 相減後的結果字串
//      */
//     public static subtractStringNumbers(numStr1: string, numStr2: string): string {
//         // 將字串轉換為 JSBI.BigInt 進行相減，避免精度損失
//         const bigInt1 = JSBI.BigInt(numStr1);
//         const bigInt2 = JSBI.BigInt(numStr2);

//         const difference = JSBI.subtract(bigInt1, bigInt2);
//         return difference.toString();
//     }

//     /**
//      * 將兩個字串表示的數字相乘
//      * @param {string} numStr1 - 字串表示的第一個數字
//      * @param {string} numStr2 - 字串表示的第二個數字
//      * @returns 相乘後的結果字串
//      */
//     public static multiplyStringNumbers(numStr1: string, numStr2: string): string {
//         // 將字串轉換為 JSBI.BigInt 進行相乘，避免精度損失
//         const bigInt1 = JSBI.BigInt(numStr1);
//         const bigInt2 = JSBI.BigInt(numStr2);

//         const product = JSBI.multiply(bigInt1, bigInt2);
//         return product.toString();
//     }

//     /**
//      * 將兩個字串表示的數字相除
//      * @param {string} numStr1 - 字串表示的第一個數字
//      * @param {string} numStr2 - 字串表示的第二個數字
//      * @returns 相除後的結果字串
//      */
//     public static divideStringNumbers(numStr1: string, numStr2: string): string {
//         // 將字串轉換為 JSBI.BigInt 進行相除，避免精度損失
//         const bigInt1 = JSBI.BigInt(numStr1);
//         const bigInt2 = JSBI.BigInt(numStr2);

//         if (JSBI.equal(bigInt2, JSBI.BigInt(0))) {
//             throw new Error('Division by zero');
//         }

//         const quotient = JSBI.divide(bigInt1, bigInt2); // / ;
//         return quotient.toString();
//     }

//     /**
//      * 轉換KM縮寫
//      * @param {string} value - 金額
//      * @param {string} ccyStr - 幣別
//      * @param {string} decimalPlaces - 要顯示小數的位數
//      * @param {string} showThousandSeparator - 是否要顯示千分位
//      * @param {string} otherAbbreviation - 例外縮寫規則,fastgame 數字鍵盤使用
//      * @param {string} onlyKAbbreviation - 是否只顯示K縮寫
//      * @param {string} padZeros - 小數點後是否要補0到小數第二位,目前只有在人民幣沒有縮寫km的時候才有作用
//      * @returns
//      */
//     private static transCoinAbbreviation(
//         value: string,
//         ccyStr: string,
//         decimalPlaces: number,
//         showThousandSeparator: boolean,
//         otherAbbreviation?: boolean,
//         onlyKAbbreviation?: boolean,
//         padZeros?: boolean
//     ): string {
//         value = value.toString();
//         let signSymbol = '';
//         if (value.startsWith('-')) {
//             signSymbol = '-';
//             value = value.substring(1);
//         } else if (value.startsWith('+')) {
//             signSymbol = '+';
//             value = value.substring(1);
//         }
//         let decimalPoint = '.';
//         //印尼文小數點為逗號
//         if (LanguageManager.Ins.CurrentLanguage === LanguageType.ID) {
//             decimalPoint = ',';
//         }
//         //例外縮寫規則,fastgame 數字鍵盤使用
//         if (otherAbbreviation) {
//             let curValue = Number(value);
//             //超過最大安全數字回傳NaN
//             if (isNaN(curValue) || curValue > Number.MAX_SAFE_INTEGER) {
//                 return 'NaN';
//             }
//             curValue = curValue / Math.pow(10, decimalPlaces);
//             if (curValue > 1e4 && curValue % 1e3 !== 0) {
//                 return signSymbol + this.formatWithThousandSeparator(value, ccyStr, showThousandSeparator);
//             }
//         }
//         let curTextArr = value.split('');
//         //新增只顯示K縮寫
//         if (curTextArr.length > 6 + decimalPlaces && !onlyKAbbreviation) {
//             curTextArr.splice(-(6 + decimalPlaces), 0, decimalPoint);
//             curTextArr = curTextArr.slice(0, -(4 + decimalPlaces));
//             let curTextStr = this.removeTrailingZeros(curTextArr, ccyStr);
//             return signSymbol + this.formatWithThousandSeparator(curTextStr, ccyStr, showThousandSeparator) + 'M';
//         } else if (curTextArr.length > 4 + decimalPlaces) {
//             curTextArr.splice(-(3 + decimalPlaces), 0, decimalPoint);
//             curTextArr = curTextArr.slice(0, -(1 + decimalPlaces));
//             let curTextStr = this.removeTrailingZeros(curTextArr, ccyStr);
//             return signSymbol + this.formatWithThousandSeparator(curTextStr, ccyStr, showThousandSeparator) + 'K';
//         } else if (decimalPlaces > 0) {
//             let curTextStr = curTextArr.join('');
//             //因為會去掉尾數0,所以0的時候要直接回傳0
//             if (curTextStr === '0' && !padZeros) {
//                 return '0';
//             } else if (curTextStr === '0' && padZeros) {
//                 return '0' + decimalPoint + '00';
//             }
//             curTextArr.splice(-decimalPlaces, 0, decimalPoint);
//             if (!padZeros) curTextStr = this.removeTrailingZeros(curTextArr, ccyStr);
//             else curTextStr = curTextArr.join('');
//             return signSymbol + this.formatWithThousandSeparator(curTextStr, ccyStr, showThousandSeparator);
//         }
//         return this.formatWithThousandSeparator(value, ccyStr, showThousandSeparator);
//     }
//     /**
//      * 去掉小數點和後面位數的0
//      * @param curTextArr
//      * @returns
//      */
//     private static removeTrailingZeros(curTextArr: string[], ccyStr: string): string {
//         let curTextStr = curTextArr.join('');
//         let decimalPoint = '.';
//         //印尼文小數點為逗號
//         if (LanguageManager.Ins.CurrentLanguage === LanguageType.ID) {
//             decimalPoint = ',';
//         }
//         // 找到小數點的位置
//         const decimalIndex = curTextArr.indexOf(decimalPoint);
//         if (decimalIndex !== -1) {
//             // 從陣列的最後一位開始移除尾隨的 '0'
//             while (curTextArr[curTextArr.length - 1] === '0') {
//                 curTextArr.pop();
//             }
//             // 如果小數點後面已無數字，則去掉小數點
//             if (curTextArr[curTextArr.length - 1] === decimalPoint) {
//                 curTextArr.pop();
//             }
//         }
//         curTextStr = curTextArr.join('');
//         return curTextStr;
//     }

//     /**
//      * 格式化為千分位並補上逗號
//      * @param value 字串
//      * @returns
//      */
//     private static formatWithThousandSeparator(value: string, ccyStr: string, showThousandSeparator: boolean): string {
//         //人民幣不需要千分位
//         if (ccyStr === 'CNY' || !showThousandSeparator) return value;
//         let thousandSeparator = ',';
//         //印尼文千分位為小數點
//         if (LanguageManager.Ins.CurrentLanguage === LanguageType.ID) {
//             thousandSeparator = '.';
//         }
//         return value.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
//     }

//     /**
//      * 顯示小數位數
//      * @param score 分數
//      * @param decimalPlaces 要顯示小數的位數
//      * @param hideDecimalsAbovePowerOfTen 大於10的n次方時隱藏小數位數
//      * @param padZeros 小數點後是否要補0到小數第二位
//      * @param ccyStr 幣別
//      * @param showThousandSeparator 是否要顯示千分位
//      * @param isFloor 小數位數無條件捨去
//      * @returns
//      */
//     private static showDecimalPlaces(
//         score: string,
//         decimalPlaces: number,
//         hideDecimalsAbovePowerOfTen: number,
//         padZeros: boolean,
//         ccyStr: string,
//         showThousandSeparator: boolean,
//         isFloor: boolean
//     ): string {
//         score = score.toString();
//         let signSymbol = '';
//         if (score.startsWith('-')) {
//             signSymbol = '-';
//             score = score.substring(1);
//         } else if (score.startsWith('+')) {
//             signSymbol = '+';
//             score = score.substring(1);
//         }

//         let decimalPoint = '.';
//         //印尼文小數點為逗號
//         if (LanguageManager.Ins.CurrentLanguage === LanguageType.ID) {
//             decimalPoint = ',';
//         }
//         if (score === '0' && !padZeros) {
//             return '0';
//         } else if (score === '0' && decimalPlaces === 0) {
//             //修正印尼盾小數位數為0時顯示為0
//             return '0';
//         } else if (score === '0' && padZeros) {
//             return '0' + decimalPoint + '00';
//         }
//         let scoreStringArr = score.split('');
//         if (decimalPlaces > 0) {
//             // 確保 scoreStringArr 至少有 decimalPlaces + 1 位數
//             while (scoreStringArr.length <= decimalPlaces) {
//                 scoreStringArr.unshift('0');
//             }
//             if (isFloor) {
//                 scoreStringArr = scoreStringArr.slice(0, -decimalPlaces);
//                 return (
//                     signSymbol +
//                     this.formatWithThousandSeparator(scoreStringArr.join(''), ccyStr, showThousandSeparator)
//                 );
//             }
//             scoreStringArr.splice(-decimalPlaces, 0, decimalPoint);

//             // 檢查小數點後的位數，並補足 0
//             let decimalIndex = scoreStringArr.indexOf(decimalPoint);
//             let actualDecimalPlaces = scoreStringArr.length - decimalIndex - 1;

//             if (actualDecimalPlaces < decimalPlaces) {
//                 let zerosToAdd = decimalPlaces - actualDecimalPlaces;
//                 for (let i = 0; i < zerosToAdd; i++) {
//                     scoreStringArr.push('0');
//                 }
//             }
//         }

//         if (hideDecimalsAbovePowerOfTen > 0 && scoreStringArr.length - 1 > hideDecimalsAbovePowerOfTen) {
//             let curScore = this.removeTrailingZeros(scoreStringArr, ccyStr);
//             return signSymbol + this.formatWithThousandSeparator(curScore, ccyStr, showThousandSeparator);
//         }

//         let scoreString = padZeros ? scoreStringArr.join('') : this.removeTrailingZeros(scoreStringArr, ccyStr);
//         return signSymbol + this.formatWithThousandSeparator(scoreString, ccyStr, showThousandSeparator);
//     }
// }
