//////////////////////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2014-present, Egret Technology.
// All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright
// notice, this list of conditions and the following disclaimer in the
// documentation and/or other materials provided with the distribution.
// * Neither the name of the Egret nor the
// names of its contributors may be used to endorse or promote products
// derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
// OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
// OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
// OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

import { GameStart } from "./GameStart";

class Main extends egret.DisplayObjectContainer {
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })



    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        this.startAnimation(result);
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        } catch (e) {
            console.error(e);
        }
    }

    private textfield: egret.TextField;
    private colorLabel: egret.TextField

    /**
    * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
    * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of
    resources/resource.json.
    */
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: string[]) {
        let parser = new egret.HtmlTextParser();

        let textflowArr = result.map(text => parser.parse(text));
        let textfield = this.textfield;
        let count = -1;
        let change = () => {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            let textFlow = textflowArr[count];

            // 切换描述内容
            // Switch to described content
            if (textfield) {
                textfield.textFlow = textFlow;
                let tw = egret.Tween.get(textfield);
                tw.to({
                    "alpha": 1
                }, 200);
                tw.wait(2000);
                tw.to({
                    "alpha": 0
                }, 200);
                tw.call(change, this);
            }
        };

        change();
    }

    // 初始化俄罗斯方块
    private initTetris() {
        // 界面的位置大小
        const originX = 120
        const originY = 100
        const boxW = 300
        const boxH = 600
        new GameStart({
            gameName: 'Tetris',
            stage: this.stage,
            screenX: originX,
            screenY: originY,
            screenW: boxW,
            screenH: boxH
        })
    }

    // todo: 点击选择游戏进入界面
    private maskTouch(e: egret.TouchEvent) {
        let c: egret.Shape = <egret.Shape>e.target
        // 移除监听器
        if (c.hasEventListener(egret.TouchEvent.TOUCH_TAP)) {
            c.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.maskTouch, this)
        }
        // 移除自身和文字
        if (c.parent) {
            this.removeChild(c)
            this.removeChild(this.colorLabel)
            // todo: 如果点击的是某个游戏 则进入该游戏界面 目前只做了tetris
            this.initTetris()
        }
    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        // 遮罩层
        let mask = new egret.Shape()
        mask.graphics.beginFill(0x000000, 0.3)
        mask.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight)
        mask.graphics.endFill()
        this.addChild(mask)
        mask.touchEnabled = true
        mask.addEventListener(egret.TouchEvent.TOUCH_TAP, this.maskTouch, this)

        // 文字
        this.colorLabel = new egret.TextField()
        this.colorLabel.textColor = 0xffffff
        this.colorLabel.width = this.stage.stageWidth - 172
        this.colorLabel.textAlign = 'center'
        this.colorLabel.text = '(选择游戏的界面)'
        this.colorLabel.size = 24
        this.colorLabel.x = 172 / 2
        this.colorLabel.y = (this.stage.stageHeight - this.colorLabel.height) / 2
        this.addChild(this.colorLabel)
    }


}