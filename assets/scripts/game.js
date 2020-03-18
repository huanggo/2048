const ROWS = 4//行数
const NUMS = [2, 4]//随机生成
const MIN_LENGHT = 50//最起码拖动的长度
const DOWM_NUM = 0.1//移动的时长
cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: cc.Label,
        score: 0,
        blockPrefab: cc.Prefab,
        gap: 20,
        bg: cc.Node
       
    },



    start() {
        this.drawBgBlock()
        this.init()
        this.Eventhander()

    },
    //初始化清空方块 与数据
    init() {
        console.log("初始化界面")
        this.updatescre(0)

        if (this.blocks) {
            for (var i = 0; i < this.blocks.length; ++i) {
                for (var j = 0; j < this.blocks[i].length; ++j) {
                    if (this.blocks[i][j] != null) {
                        this.blocks[i][j].destroy()
                    }
                }
            }
        }
        this.blocks = []
        this.data = []

        for (var k = 0; k < ROWS; ++k) {
            this.blocks.push([null, null, null, null])
            this.data.push([0, 0, 0, 0])
        }
        //开始生成块
        for (var h = 0; h < 3; h++) {
            this.addblock()
        }
    },
    //找出空闲的快
    getEmptyBlock() {
        var location = []

        for (var i = 0; i < this.blocks.length; ++i) {
            for (var j = 0; j < this.blocks[i].length; ++j) {
                if (this.blocks[i][j] == null) {
                    location.push({ x: i, y: j })
                }
            }
        }
        return location

    },
    addblock() {
        var location = this.getEmptyBlock()
        if (location.length == 0) return false
        var local = location[Math.floor(cc.random0To1() * location.length)]
        var x = local.x
        var y = local.y
        let postion = this.position[x][y]
        let block = cc.instantiate(this.blockPrefab)
        block.width = this.blockSize
        block.height = this.blockSize
        this.bg.addChild(block)
        block.setPosition(postion)
        let number = NUMS[Math.floor(cc.random0To1() * NUMS.length)]
        block.getComponent("block").setNumber(number)
        this.blocks[x][y] = block
        this.data[x][y] = number
        return true

    },
    updatescre(number) {
        this.score = number
        this.scoreLabel.string = "分数:" + number
    },
    // update (dt) {},
    //绘制方块
    drawBgBlock() {
        this.blockSize = (cc.winSize.width - this.gap * (ROWS + 1)) / ROWS
        var x = this.gap + this.blockSize / 2
        var y = this.blockSize
        this.position = []
        for (var i = 0; i < ROWS; ++i) {
            this.position.push([0, 0, 0, 0]);
            for (var j = 0; j < ROWS; ++j) {
                var block = cc.instantiate(this.blockPrefab)
                block.width = this.blockSize
                block.height = this.blockSize
                this.bg.addChild(block)
                block.setPosition(cc.v2(x, y))
                this.position[i][j] = cc.v2(x, y)
                x += this.gap + this.blockSize
                block.getComponent("block").setNumber(0)
            }
            y += this.gap + this.blockSize
            x = this.gap + this.blockSize / 2
        }
    },
    //事件
    Eventhander() {
        this.bg.on('touchstart', (event) => {
            this.startpoint = cc.v2(event.getLocation().x, event.getLocation().y) //获取起始位置
        })

        this.bg.on('touchend', (event) => {
            this.touchend(event)

        })
        this.bg.on('touchcancel', (event) => {
            this.touchend(event)

        })
    },
    touchend(event) {
        this.endpoint = cc.v2(event.getLocation().x, event.getLocation().y)//终点位置
        console.log("取向量的模长this.endpoint----", this.endpoint.mag())
        let vec = this.endpoint.sub(this.startpoint);//cc.pSup(this.endpoint, this.startpoint)
        let distance = vec.mag(); //取向量的模长
        console.log("取向量的模长----", distance)
        if (distance > MIN_LENGHT) {
            if (Math.abs(vec.x) > Math.abs(vec.y)) {
                //水平方向
                if (vec.x > 0) {
                    this.moveRight()
                } else {
                    this.moveLeft()
                }
            } else {
                //垂直方向
                if (vec.y > 0) {
                    this.moveUp()
                } else {
                    this.moveDown()
                }

            }
        }


    },
    aftermove(hasmove) {//大家都准备好后
        if (hasmove) {
            this.addblock()
        }

    },
    domove(block, position, callback) {
        let action = cc.moveTo(DOWM_NUM, position)
        let finish = cc.callFunc(() => {
            callback && callback()
        })
        block.runAction(cc.sequence(action, finish))
    },
    moveRight() {
        console.log("moveRight----")

        let hasmove = false
        let move = (x, y, callback) => {
            if (y == 3 || this.data[x][y] == 0) {//结束到顶
                callback && callback()  //结束
                return
            } else if (this.data[x][y + 1] == 0) {//移动
                let block = this.blocks[x][y]
                let position = this.position[x][y + 1]
                this.blocks[x][y + 1] = block
                this.data[x][y + 1] = this.data[x][y]

                this.data[x][y] = 0
                this.blocks[x][y] = null
                this.domove(block, position, () => {
                    move(x, y + 1, callback)
                })
                hasmove = true
            } else if (this.data[x][y + 1] == this.data[x][y]) {//合并
                let block = this.blocks[x][y]
                let position = this.position[x][y + 1]
                this.data[x][y + 1] *= 2
                this.data[x][y] = 0
                this.blocks[x][y] = null
                this.blocks[x][y + 1].getComponent('block').setNumber(this.data[x][y + 1])
                this.domove(block, position, () => {
                    block.destroy()
                    callback && callback()
                })
                hasmove = true

            } else {
                callback && callback()  //结束
                return
            }
        }
        let tomove = [];
        for (let i = 0; i < ROWS; ++i) {
            for (let j = ROWS - 1; j >= 0; --j) {
                if (this.data[i][j] != 0) {
                    tomove.push({ x: i, y: j })
                }
            }
        }
        let count = 0
        for (let i = 0; i < tomove.length; ++i) {
            move(tomove[i].x, tomove[i].y, () => {
                count++
                if (count == tomove.length) {
                    this.aftermove(hasmove)
                }
            })
        }

    },
    moveLeft() {
        console.log("moveLeft----")
        let hasmove = false
        let move = (x, y, callback) => {
            if (y == 0 || this.data[x][y] == 0) {//结束到顶
                callback && callback()  //结束
                return
            } else if (this.data[x][y - 1] == 0) {//移动
                let block = this.blocks[x][y]
                let position = this.position[x][y - 1]
                this.blocks[x][y - 1] = block
                this.data[x][y - 1] = this.data[x][y]

                this.data[x][y] = 0
                this.blocks[x][y] = null
                this.domove(block, position, () => {
                    move(x, y - 1, callback)
                })
                hasmove = true
            } else if (this.data[x][y - 1] == this.data[x][y]) {//合并
                let block = this.blocks[x][y]
                let position = this.position[x][y - 1]
                this.data[x][y - 1] *= 2
                this.data[x][y] = 0
                this.blocks[x][y] = null
                this.blocks[x][y - 1].getComponent('block').setNumber(this.data[x][y - 1])
                this.domove(block, position, () => {
                    block.destroy()
                    callback && callback()
                })
                hasmove = true

            } else {
                callback && callback()  //结束
                return
            }
        }
        let tomove = [];
        for (let i = 0; i < ROWS; ++i) {
            for (let j = 0; j < ROWS; ++j) {
                if (this.data[i][j] != 0) {
                    tomove.push({ x: i, y: j })
                }
            }
        }
        let count = 0
        for (let i = 0; i < tomove.length; ++i) {
            move(tomove[i].x, tomove[i].y, () => {
                count++
                if (count == tomove.length) {
                    this.aftermove(hasmove)
                }
            })
        }
    },
    moveUp() {
        console.log("moveUp----")
        let hasmove = false
        let move = (x, y, callback) => {
            if (x == 3 || this.data[x][y] == 0) {//结束到顶
                callback && callback()  //结束
                return
            } else if (this.data[x + 1][y] == 0) {//移动
                let block = this.blocks[x][y]
                let position = this.position[x + 1][y]
                this.blocks[x + 1][y] = block
                this.data[x + 1][y] = this.data[x][y]

                this.data[x][y] = 0
                this.blocks[x][y] = null
                this.domove(block, position, () => {
                    move(x + 1, y, callback)
                })
                hasmove = true
            } else if (this.data[x + 1][y] == this.data[x][y]) {//合并
                let block = this.blocks[x][y]
                let position = this.position[x + 1][y]
                this.data[x + 1][y] *= 2
                this.data[x][y] = 0
                this.blocks[x][y] = null
                this.blocks[x + 1][y].getComponent('block').setNumber(this.data[x + 1][y])
                this.domove(block, position, () => {
                    block.destroy()
                    callback && callback()
                })
                hasmove = true

            } else {
                callback && callback()  //结束
                return
            }
        }
        let tomove = [];
        for (let i = 3; i >= 0; --i) {
            for (let j = 0; j < ROWS; ++j) {
                if (this.data[i][j] != 0) {
                    tomove.push({ x: i, y: j })
                }
            }
        }
        let count = 0
        for (let i = 0; i < tomove.length; ++i) {
            move(tomove[i].x, tomove[i].y, () => {
                count++
                if (count == tomove.length) {
                    this.aftermove(hasmove)
                }
            })
        }
    },
    moveDown() {
        console.log("moveDown----")
        let hasmove = false
        let move = (x, y, callback) => {
            if (x == 0 || this.data[x][y] == 0) {//结束到顶
                callback && callback()  //结束
                return
            } else if (this.data[x - 1][y] == 0) {//移动
                let block = this.blocks[x][y]
                let position = this.position[x - 1][y]
                this.blocks[x - 1][y] = block
                this.data[x - 1][y] = this.data[x][y]

                this.data[x][y] = 0
                this.blocks[x][y] = null
                this.domove(block, position, () => {
                    move(x - 1, y, callback)
                })
                hasmove = true
            } else if (this.data[x -1][y] == this.data[x][y]) {//合并
                let block = this.blocks[x][y]
                let position = this.position[x - 1][y]
                this.data[x - 1][y] *= 2
                this.data[x][y] = 0
                this.blocks[x][y] = null
                this.blocks[x - 1][y].getComponent('block').setNumber(this.data[x - 1][y])
                this.domove(block, position, () => {
                    block.destroy()
                    callback && callback()
                })
                hasmove = true

            } else {
                callback && callback()  //结束
                return
            }
        }
        let tomove = [];
        for (let i = 0; i<ROWS; ++i) {
            for (let j = 0; j < ROWS; ++j) {
                if (this.data[i][j] != 0) {
                    tomove.push({ x: i, y: j })
                }
            }
        }
        let count = 0
        for (let i = 0; i < tomove.length; ++i) {
            move(tomove[i].x, tomove[i].y, () => {
                count++
                if (count == tomove.length) {
                    this.aftermove(hasmove)
                }
            })
        }
    }


});
