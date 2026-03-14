import {
    _decorator,
    Component,
    Node,
    Color,
    UITransform,
    Layout,
    SpriteFrame,
    Rect,
    Sprite,
    tween,
    Vec3,
    Label,
    Layers,
} from 'cc';
import { NodeFactory } from '../../../../../../core/utils/NodeFactory';
import { ResManager } from '../../../../../../core/systems/resource/ResManager';
import { LanguageManager } from '../../../../../../core/systems/language/LanguageManager';
import { MultiplierMeter } from '../../view/MultiplierMeter';
import { GameConfig } from '../../config/GameConfig';

const { ccclass } = _decorator;

/**
 * TopInfoPanel - 頂部資訊顯示區
 * 單一職責：管理餘額、贏分、次數、倍率表的UI
 */
@ccclass('TopInfoPanel')
export class TopInfoPanel extends Component {
    private _balanceLabel: Label | null = null;
    private _winLabel: Label | null = null;
    private _freeSpinLabel: Label | null = null;
    private _multiplierMeter: MultiplierMeter | null = null;

    private getUITransform(node: Node = this.node): UITransform {
        return node.getComponent(UITransform) || node.addComponent(UITransform);
    }

    protected onLoad(): void {
        this._buildUI();
    }

    private _buildUI(): void {
        const trans = this.getUITransform();
        trans.setContentSize(1280, 80);

        // 1. 半透明深色背景
        const bg = NodeFactory.createSpriteNode('Bg', new Color(0, 0, 0, 200)).node;
        this.node.addChild(bg);
        bg.getComponent(UITransform)!.setContentSize(1280, 80);

        // 2. 金色裝飾線
        const line = NodeFactory.createSpriteNode('Line', new Color(139, 69, 19)).node;
        this.node.addChild(line);
        line.getComponent(UITransform)!.setContentSize(1280, 4);
        line.setPosition(0, -38);

        // 3. Jackpot 佈局
        const jackpotNode = new Node('Jackpots');
        this.node.addChild(jackpotNode);
        jackpotNode.setPosition(0, 10);
        const layout = jackpotNode.addComponent(Layout);
        layout.type = Layout.Type.HORIZONTAL;
        layout.spacingX = 60;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;

        const jackpots = [
            { name: 'GRAND', color: '#FFD700', value: '240,397.57' },
            { name: 'MAJOR', color: '#C0C0C0', value: '40,567.18' },
            { name: 'MINOR', color: '#CD7F32', value: '7,689.74' },
            { name: 'MINI', color: '#FFFFFF', value: '1,925.52' },
        ];

        jackpots.forEach(j => {
            const box = new Node(j.name);
            jackpotNode.addChild(box);
            box.addComponent(UITransform).setContentSize(250, 40);

            const { label: nameLbl } = NodeFactory.createLabelNode('Name', j.name, 18);
            nameLbl.color = new Color().fromHEX(j.color);
            nameLbl.node.setPosition(-80, 0);
            box.addChild(nameLbl.node);

            const { label: valLbl } = NodeFactory.createLabelNode('Val', j.value, 20);
            valLbl.color = Color.WHITE;
            valLbl.node.setPosition(40, 0);
            box.addChild(valLbl.node);
        });

        // 4. 跑馬燈 / 狀態顯示區
        const marqueeNode = new Node('Marquee');
        this.node.addChild(marqueeNode);
        marqueeNode.setPosition(0, -20);
        const { label: marquee } = NodeFactory.createLabelNode('Text', '恭喜玩家在 [戰神賽特] 贏得大獎！', 16);
        marquee.color = new Color(255, 255, 100);
        marqueeNode.addChild(marquee.node);

        // 5. 倍數表 (放在右側)
        const meterNode = new Node('MultiplierMeter');
        this.node.addChild(meterNode);
        meterNode.setPosition(550, 0);
        this._multiplierMeter = meterNode.addComponent(MultiplierMeter);

        // 移除 Balance/Win/FS 從 TopPanel，因為它們現在搬移到 ControlPanel (Bottom Bar)
    }

    public updateBalance(val: number): void {
        if (this._balanceLabel)
            this._balanceLabel.string = val.toLocaleString(undefined, { minimumFractionDigits: 2 });
    }

    public updateWin(val: number): void {
        if (!this._winLabel) return;

        const currentVal = parseFloat(this._winLabel.string.replace(/,/g, '')) || 0;
        if (val === currentVal) return;

        const obj = { value: currentVal };
        tween(obj)
            .to(
                0.5,
                { value: val },
                {
                    onUpdate: () => {
                        if (this._winLabel) {
                            this._winLabel.string = obj.value.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                            });
                        }
                    },
                },
            )
            .start();
    }

    public updateFreeSpin(val: number): void {
        if (this._freeSpinLabel) this._freeSpinLabel.string = val.toString();
    }

    public updateMultiplier(val: number): void {
        if (this._multiplierMeter) this._multiplierMeter.updateValue(val);
    }

    public getMultiplierWorldPosition(): Vec3 {
        if (this._multiplierMeter) {
            return this._multiplierMeter.node.worldPosition;
        }
        return this.node.worldPosition;
    }
}
