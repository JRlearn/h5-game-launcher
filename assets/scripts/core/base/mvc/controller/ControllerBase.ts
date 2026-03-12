/**
 * 共用遊戲MVC基底，將大廳接到的事件轉到這處理<br>
 * @abstract
 * @class ControllerBase
 * @implements Common.GameFramework.Entry.IGameObject
 * @memberof Common.GameFramework.Controller
 */
export abstract class ControllerBase<TView, TModel> {
    /**
     * 遊戲畫面
     */
    protected view: TView;

    /**
     * 遊戲model
     */
    protected model: TModel;

    /**
     * 建構子
     * @param view - 顯示模組
     * @param model - 資料模組
     */
    constructor(view: TView, model: TModel) {
        this.view = view;
        this.model = model;
    }
}
