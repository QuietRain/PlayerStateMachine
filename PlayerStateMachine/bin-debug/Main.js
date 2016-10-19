//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var sky = this.createBitmapByName("map_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        //////////////////////////////////动画
        var data = RES.getRes("Archer_Idle_json");
        var txtr = RES.getRes("Archer_Idle_png");
        var mcFactory = new egret.MovieClipDataFactory(data, txtr);
        var mc1 = new egret.MovieClip(mcFactory.generateMovieClipData("Archer_Idle"));
        var data = RES.getRes("Archer_Move_json");
        var txtr = RES.getRes("Archer_Move_png");
        var mcFactory = new egret.MovieClipDataFactory(data, txtr);
        var mc2 = new egret.MovieClip(mcFactory.generateMovieClipData("Archer_Move"));
        var standrongqi = new egret.DisplayObjectContainer();
        var moverongqi = new egret.DisplayObjectContainer();
        /////////////////////////////////开始
        this.touchEnabled = true;
        this.addChild(standrongqi);
        this.addChild(moverongqi);
        var _statemachine = new StateMachine(this, standrongqi, moverongqi, mc1, mc2);
        _statemachine.onEnter();
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e) {
            _statemachine.targetX = e.stageX;
            _statemachine.targetY = e.stageY;
            _statemachine.currentState.onExit();
        }, this);
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description_json", this.startAnimation, this);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    p.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];
            self.changeDescription(textfield, lineArr);
            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    p.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
var StateMachine = (function () {
    function StateMachine(_player, standrongqi, moverongqi, stand, move) {
        console.log("StateMachine constructor");
        this._standrongqi = standrongqi;
        this._moverongqi = moverongqi;
        this._stand = stand;
        this._move = move;
        this.StandState = new PlayerStandState(_player, this);
        this.MoveState = new PlayerMoveState(_player, this);
        if (_player == null) {
            console.log("No picture,StateMachine");
        }
        this.player = _player;
        this.currentState = new PlayerStandState(_player, this);
    }
    var d = __define,c=StateMachine,p=c.prototype;
    p.onEnter = function () {
        console.log("StateMachine onEnter");
        console.log(this.currentState);
        this.currentState.onEnter();
    };
    p.onExit = function () {
        console.log("StateMachine onExit");
        this.currentState.onExit();
    };
    return StateMachine;
}());
egret.registerClass(StateMachine,'StateMachine');
////////////////////////////////////////////移动状态
var PlayerMoveState = (function () {
    function PlayerMoveState(player, stateMachine) {
        console.log("PlayerMoveState constructor");
        this._StateMachine = stateMachine;
        this._player = player;
    }
    var d = __define,c=PlayerMoveState,p=c.prototype;
    p.onEnter = function () {
        console.log("PlayerMoveState onEnter");
        var _character = egret.Tween.get(this._StateMachine._moverongqi);
        //////////////////////////////////调用走路动画
        this._StateMachine._moverongqi.addChild(this._StateMachine._move);
        this._StateMachine._move.gotoAndPlay(1, -1);
        _character.to({ x: this._StateMachine.targetX, y: this._StateMachine.targetY }, 1000);
        this._StateMachine._standrongqi.x = this._StateMachine.targetX;
        this._StateMachine._standrongqi.y = this._StateMachine.targetY;
        this._StateMachine.currentState.onExit();
    };
    p.onExit = function () {
        var _this = this;
        console.log("PlayerMoveState onExit");
        var tim = new egret.Timer(1000, 1);
        tim.start();
        tim.addEventListener(egret.TimerEvent.TIMER, function () {
            _this._StateMachine._moverongqi.removeChild(_this._StateMachine._move);
            _this._StateMachine._standrongqi.alpha = 1;
        }, this);
        this._StateMachine.currentState = this._StateMachine.StandState;
        this._StateMachine.currentState.onEnter();
    };
    return PlayerMoveState;
}());
egret.registerClass(PlayerMoveState,'PlayerMoveState',["State"]);
////////////////////////////////////站立状态
var PlayerStandState = (function () {
    function PlayerStandState(player, stateMachine) {
        console.log("PlayerStandState constructor");
        this._StateMachine = stateMachine;
        this._player = player;
    }
    var d = __define,c=PlayerStandState,p=c.prototype;
    p.onEnter = function () {
        console.log("PlayerStandState onEnter");
        ///////////////调用站立动画
        this._StateMachine._standrongqi.addChild(this._StateMachine._stand);
        this._StateMachine._stand.gotoAndPlay(1, -1);
    };
    p.onExit = function () {
        console.log("PlayerStandState onExit");
        this._StateMachine._standrongqi.alpha = 0;
        this._StateMachine.currentState = this._StateMachine.MoveState;
        this._StateMachine.currentState.onEnter();
    };
    return PlayerStandState;
}());
egret.registerClass(PlayerStandState,'PlayerStandState',["State"]);
///////////////////////////////////状态机
/*
class StateMachine {
   _currentState: State;
   private s: String;

   setState(s: String) {
       console.log(s);
       if (this._currentState.s == "stand") {
           this._currentState.onExit();
       }
       this._currentState = s;
       this._currentState.onEnter();
   }
}

var s: StateMachine;
s._currentState

interface State {

}*/
//# sourceMappingURL=Main.js.map