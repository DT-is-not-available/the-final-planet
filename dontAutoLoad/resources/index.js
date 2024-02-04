{
	// so i can copy all methods to the prototype (basically extending game class)
	const OldGame = Game

	// this was basically copied directly from the code
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
	}

	// the new prototype for the Game class
	const newproto = {
		// main menu
		createMainMenu() {
			// call the old main menu script, this creates the default main menu
			OldGame.prototype.createMainMenu.call(this)
			// replace the background city with the backgroundOnly city, a scenario thats
			// literally just a 1 width tile of island off in the distance
			this.state.bgCity = new City(this,this.state.bgCity.outerStage,"backgroundOnly",true,null);
			// get menu that was just made
			const menu = this.state
			if (!localStorage.planetPlayed) {
				// screen that appears if you've never played planet mod before
				var bb = menu.addBottomButton("- " + common_Localize.lo("click_here_to_play") + " -",()=>{
					// this is placeholder, change this later once things actually start working right
					this.newPlanet("backgroundOnly","-");
					Config.doPlay();
				},null,"Arial18");
				menu.bottomButtonAttract.set(bb,true);
				var bb = menu.addBottomButton("",()=>{},null,"Arial18");
			} else {
				// typical continue, new_city, and load_city buttons
				var bb = menu.addBottomButton("- " + common_Localize.lo("continue") + " -",()=>{
					// all these callbacks are placeholder
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
			// disable the function that adds the menu buttons, cuz its about to add the default ones
			// and We Dont Want That:tm:
			menu.addBottomButton = function(){}
			menu.bottomButtonAttract.set = function(){}
			// IMAGE FOR THE THUMBNAIL!!!!!1!
			var PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD = new PIXI.Sprite(Resources.getTexture("spr_home_planet"))
			PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD.anchor.set(0.5)
			PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD.position.x = window.innerWidth/2
			PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD.position.y = window.innerHeight/2
			PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD.scale.x = 2
			PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD.scale.y = 2
			this.state.bgCity.outerStage.addChild(PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD)
			this.state.planetimg = PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD

			// github icon
			var githubButtonImage = Resources.getTexture("spr_github_icon");
			var githubButtonSprite = new PIXI.Sprite(githubButtonImage);
			const _gthis = this.state
			const game = this
			this.state.githubButton = { theSprite : githubButtonSprite, onClick : function() {
			}, onHover : function() {
				_gthis.gui.tooltip.setText(_gthis.creditsButton,"The Final Planet on GitHub");
				game.setOnClickTo = function() {
					window.open("https://github.com/DT-is-not-available/the-final-planet","_blank");
				};
			}};
			this.state.bottomButtonStage.addChild(this.state.githubButton.theSprite);
			this.state.otherButtons.push(this.state.githubButton);
			const oldposel = menu.positionUIElements
			menu.positionUIElements = function(...a) {
				PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD.position.x = window.innerWidth/2
				PLANET_OMFG_NO_WAY_ITS_THE_PLANET_FROM_THE_FINAL_PLANET_MOD.position.y = window.innerHeight/2
				oldposel.call(menu, ...a)
				try {
					var yPosSmallButtons = game.rect.height - 24 - this.gui.safeAreaBottom;
					var offset = 176 + this.gui.safeAreaLeft;
					var yOffset = 0;
					var _this_x = offset;
					var _this_y = yPosSmallButtons + yOffset;
					var tmp = new PIXI.Point(_this_x,_this_y);
					this.githubButton.theSprite.position = tmp;
				} catch (e) {
					alert(e)
				}
			}
		},
		// i changed one (1) line of code here, and all it does is initiates the Planet class instead of City
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

	// basically need to reimplement all of 'City' class for a circular world

	// will need to include new ways of placing buildings and handling citizens

	// very little can be copied from just the source, most needs to be rewritten
	// to take into account that the world is round now

	// this is gonna be a big one

	var Planet = function(game,stage,storyName,displayOnly,cityFile) {

	}

	Planet.prototype = {
		update(timeMod) {

		},
		postDraw() {

		},
		handleMouse(mouse) {

		}
	}

	// apply the new game prototype to the new Game class, but copy the old methods
	// if those methods arent provided

	Game.prototype = {}

	Object.assign(Game.prototype, OldGame.prototype)
	Object.assign(Game.prototype, newproto)
}