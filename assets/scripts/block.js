
cc.Class({
    extends: cc.Component,

    properties: {
        numLabel: cc.Label,
        
    },
    
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.color=window.colors
    },
    setNumber(number) {
        if (number == 0) {
            this.numLabel.node.active = false
        }
        this.numLabel.string = number + ""
        
       // if (number != 0) {
            for (var v in this.color) {
                console.log("颜色-----",this.color[number])
                this.node.color =this.color[number]
            }
        //}


    }

    // update (dt) {},
});
