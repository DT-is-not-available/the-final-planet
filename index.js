const OldGame = Game

var Game = $hxClasses["Game"] = function(application,stage,gameRect,addX,addY,scaling,isMobile) {
	this.tempSavedState = null;
	this.workshopOverlay = null;
	this.tapToContinue = null;
	this.gamePausedFor = 0;
	this.isLargeMobile = false;
	this.isMobile = false;
	this.setOnClickTo = null;
	this.onClick = null;
	this.state = null;
	var _gthis = this;
	this.application = application;
	this.stage = stage;
	this.keyboard = new Keyboard(this);
	this.audio = new Audio(this);
	this.isMobile = isMobile;
	this.currentlyPausedForReasons = [];
	this.resize(gameRect,addX,addY,scaling);
	this.initInteraction(stage);
	if(isMobile) {
		this.mouse.isTouch = true;
	}
	this.textHelper = new common_TextHelper(this);
	common_Localize.init(this);
	if(!Game.isLoading) {
		this.metaGame = new progress_MetaGame(function() {
			mobileSpecific_Premium.init(_gthis,function() {
				common_AdHelper.prepare(function() {
                    _gthis.createMainMenu()
				});
			});
		});
		this.addImportHandler();
	}
	Config.gameInit(this);
	modding_ModTools._performOnModsLoaded(this);
    this.create()
}

const newproto = {
    create() {

    },
    createMainMenu() {
        OldGame.prototype.createMainMenu.call(this)
        this.state.bgCity = new City(this,this.state.bgCity.outerStage,"backgroundOnly",true,null);
        const menu = this.state
        if (!localStorage.planetPlayed) {
            var bb = menu.addBottomButton("- " + common_Localize.lo("click_here_to_play") + " -",()=>{
                this.newPlanet("backgroundOnly","-");
                Config.doPlay();
            },null,"Arial18");
            menu.bottomButtonAttract.set(bb,true);
            var bb = menu.addBottomButton("",()=>{},null,"Arial18");
        } else {
            var bb = menu.addBottomButton("- " + common_Localize.lo("continue") + " -",()=>{
                this.newPlanet("backgroundOnly","-");
                Config.doPlay();
            },null,"Arial16");
            var bb = menu.addBottomButton("- " + common_Localize.lo("new_city") + " -",()=>{
                this.newPlanet("backgroundOnly","-");
                Config.doPlay();
            },null,"Arial16");
            var bb = menu.addBottomButton("- " + common_Localize.lo("load_city") + " -",()=>{
                this.newPlanet("backgroundOnly","-");
                Config.doPlay();
            },null,"Arial16");
        }
        menu.positionUIElements();
        menu.addBottomButton = function(){}
        menu.bottomButtonAttract.set = function(){}
        var PLANET = new PIXI.Sprite(Resources.getTexture("spr_home_planet"))
        PLANET.anchor.set(0.5)
        PLANET.position.x = window.innerWidth/2
        PLANET.position.y = window.innerHeight/2
        PLANET.scale.x = 2
        PLANET.scale.y = 2
        this.state.bgCity.outerStage.addChild(PLANET)
        this.state.planetimg = PLANET
    },
    update(timeMod) {
        this.mouseBeginStep();
		this.mouse.timeMod = timeMod;
		this.keyboard.update();
		if(5 == 5) {
			common_DesktopHelpers.update(this);
		}
		if(jsFunctions.crossPromoIsVisible() && this.keyboard.anyBack()) {
			jsFunctions.crossPromoClose();
			this.keyboard.pressed[27] = false;
		}
		if(this.workshopOverlay != null && this.workshopOverlay.isOpen() && this.keyboard.anyBack()) {
			this.workshopOverlay.createOrClose();
			this.keyboard.pressed[27] = false;
		}
		Config.handleInput(this.mouse,this.keyboard);
		this.mouse.preHandling();
		this.setOnClickTo = null;
		if(this.state != null && (!this.isMobile || !this.mouse.hasStrongClaim || this.mouse.strongClaimOnUpdate == null)) {
			this.state.handleMouse(this.mouse);
		}
		this.onClick = this.setOnClickTo;
		this.mouse.afterHandling();
		if(this.state != null) {
			if(this.currentlyPausedForReasons.indexOf("WaitAndShowAd") == -1) {
				this.state.update(timeMod);
			}
		}
		this.updateForceUnpause(timeMod);
		Settings.update(this);
		if(Config.mobileTrailerMode && this.keyboard.down[17] && this.keyboard.pressed[116]) {
			Config.mobileTrailerModeMultiplier += 0.5;
			if(Config.mobileTrailerModeMultiplier > 3) {
				Config.mobileTrailerModeMultiplier = 2;
			}
			this.application.setGameScale();
		}
		this.mouseEndStep(timeMod);
		this.keyboard.postUpdate();
		Analytics.update(timeMod);
		mobileSpecific_WaitAndShowAd.generalUpdate(timeMod);
		common_MobileApplicationLifecycleManager.update(timeMod);
		if(this.waitAndShowAdInstance != null) {
			this.waitAndShowAdInstance.update(timeMod);
		}
    },
    postDraw() {
        if(this.state != null) {
			this.state.postDraw();
		}
    },
	resize(gameRect,addX,addY,scaling) {
		this.rect = gameRect;
		this.addX = addX;
		this.addY = addY;
		this.scaling = scaling;
		var tmp = Infinity;
		this.stage.hitArea = new PIXI.Rectangle(0,0,tmp,Infinity);
		this.stage.interactiveChildren = false;
		if(this.state != null) {
			this.state.resize();
            if (this.state.planetimg) {
                this.state.planetimg.position.x = window.innerWidth/2
                this.state.planetimg.position.y = window.innerHeight/2
            }
		}
	},
    newPlanet(storyName,saveFileName,displayOnly,afterDone) {
		if(displayOnly == null) {
			displayOnly = false;
		}
		var _gthis = this;
		this.stopState();
		var onDone = function() {
			var theCity = new Planet(_gthis,_gthis.stage,storyName,displayOnly,saveFileName);
			_gthis.state = theCity;
			_gthis.afterStateSwitch();
			_gthis.updateCityMousePos();
			_gthis.mouse.releaseAllClaims(true);
			Config.doPlay();
			if(saveFileName.indexOf("-") == -1) {
				common_Storage.setItem("__meta_mostRecentSubOf_" + saveFileName,theCity.cityFile,function() {
				});
			}
			if(afterDone != null) {
				afterDone(theCity);
			}
		};
		if(Object.prototype.hasOwnProperty.call(Resources.storiesInfo.h,storyName)) {
			onDone();
		} else {
			new progress_StoryLoader(storyName,function() {
				onDone();
			},function() {
				_gthis.createMainMenu(common_Localize.lo("game_load_error"));
			});
		}
		Config.onCitySwitch();
	}
}

var Planet = function(game,stage,storyName,displayOnly,cityFile) {

}

// basically need to reimplement all of 'City' class for a circular world
// will need to include new ways of placing buildings and handling citizens
// this is gonna be a big one

Planet.prototype = {
    update(timeMod) {

    },
    postDraw() {

    },
    handleMouse(mouse) {

    }
}

Game.prototype = {}

Object.assign(Game.prototype, OldGame.prototype)
Object.assign(Game.prototype, newproto)