export class GameModel {
    private inputNumber: string[] = ['0', '0', '0', '0']; // 用來存放玩家輸入的數字
    public inputIndex: number = 0;
    public setupNumIndex: number = 0;
    public nickName: string = ''; // 玩家暱稱
    private uid: string = ''; // 玩家ID

    private joinRoomId: string = ''; // 房間ID

    private setupGuessNums: string[] = ['0', '0', '0', '0'];

    setSetupGuessNums(nums: string[]) {
        this.setupGuessNums = nums;
    }
    getSetupGuessNums() {
        return this.setupGuessNums;
    }

    setJoinRoomId(joinRoomId: string) {
        this.joinRoomId = joinRoomId; // 設置房間ID
    }

    getJoinRoomId() {
        return this.joinRoomId; // 獲取房間ID
    }

    getUid() {
        return this.uid; // 獲取玩家ID
    }
    setUid(uid: string) {
        this.uid = uid; // 設置玩家ID
    }

    public reset() {
        this.setupNumIndex = 0;
        this.inputIndex = 0;
        this.setupGuessNums = ['0', '0', '0', '0'];
        this.inputNumber = ['0', '0', '0', '0'];
        this.joinRoomId = '';
    }

    public setNickName(nickName: string) {
        this.nickName = nickName; // 設置玩家暱稱
    }

    public getNickName() {
        return this.nickName; // 獲取玩家暱稱
    }

    public hasNickName(): boolean {
        return this.nickName !== '';
    } // 判斷是否有暱稱

    public getInputNumbers() {
        return this.inputNumber;
    }
    public setInputNumber(inputNumber: string[]) {
        this.inputNumber = inputNumber;
    }

    public updateInputNumber(index: number, number: string) {
        if (index >= 0 && index <= this.inputNumber.length) {
            this.inputNumber[index] = number; // 更新指定索引的數字
        } else {
            console.error('索引超出範圍', index);
        }
    }

    public updateSetupNumber(index: number, number: string) {
        if (index >= 0 && index <= this.setupGuessNums.length) {
            this.setupGuessNums[index] = number; // 更新指定索引的數字
        } else {
            console.error('索引超出範圍', index);
        }
    }

    public resetInputNumber() {
        this.inputNumber = ['0', '0', '0', '0']; // 重置玩家輸入的數字
    }

    public resetSetupGuessNums() {
        this.setupGuessNums = ['0', '0', '0', '0'];
    }

    public init() {}
}
