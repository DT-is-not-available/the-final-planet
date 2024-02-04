{
    let old = gui_CreditsWindow.create
    gui_CreditsWindow.create = function(city,gui,stage,$window) {
        const windowAddBottomButtons = gui.windowAddBottomButtons
        gui.windowAddBottomButtons = function(){}
        old.call(this, city,gui,stage,$window)
        gui.windowAddBottomButtons = windowAddBottomButtons
        const credits = `
        
        #The Final Planet Mod
        
        Created by DT
        Other Lines of Credit Go Here
        Things like "this guy did sprites"

        Other Contributors
        this is where we list the people who did minor pull requests and such
        `.split("\n")
        for (let i = 0; i < credits.length-1; i++) {
            if (credits[i].trimStart() == "") {
                $window.addChild(new gui_GUISpacing($window,new common_Point(2,6)));
            } else {
                let line = credits[i].trimStart()
                let font = "Arial"
                if (line.startsWith("#")) {
                    line = line.replace("#","")
                    font = "Arial16"
                }
                $window.addChild(new gui_TextElement($window,stage,line,null,font));
            }
        }
        gui.windowAddBottomButtons()
    }
}