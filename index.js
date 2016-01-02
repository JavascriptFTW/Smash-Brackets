var Bracket = (function() {
    
    function BracketSlot(cfg) {
        this.player = cfg.player || "";
        this.title = cfg.title || "Smasher"
        this.leadsTo = cfg.leadsTo;
        this.advanced = false;
        this.$el = $("<div>")
            .addClass("smash-bracket-slot");
        this.$title = $("<div>")
            .addClass("smash-bracket-slot-title")
            .text(this.title);
        this.$player = $("<div>")
            .addClass("smash-bracket-slot-player")
            .attr({
                "contenteditable": true,
                "spellcheck": false
            })
            .text(this.player)
            .on("keydown", this.handleKeyDown.bind(this));
        this.$advance = $("<button>")
            .addClass("smash-bracket-slot-advance")
            .text("Advance Player")
            .attr("disabled", this.leadsTo === undefined)
            .on("click", this.advance.bind(this));
        this.$el.append(this.$title, this.$player, this.$advance);
    }
    
    BracketSlot.prototype = {
        advance: function() {
            if (this.leadsTo !== undefined) {
                this.leadsTo.setPlayer(this.player);
            }
            this.advanced = true;
        },
        setPlayer(player) {
            this.player = player;
            this.$player.text(this.player);
        },
        setTitle(title) {
            this.title = title;
            this.$title.text(this.title);
        },
        setLeadsTo(leadsTo) {
            this.leadsTo = leadsTo;
            this.$advance.attr("disabled", this.leadsTo === undefined);
        },
        attachTo($el) {
            $el.append(this.$el);
        },
        handleKeyDown(evt) {
            if (evt.keyCode === 13) {
                evt.preventDefault();
            } else {
                this.name = this.$player.text();
            }
        }
    };
    
    
    
    function BracketGroup(cfg) {
        this.slots = cfg.slots || [];
        this.title = cfg.title || "";
        this.leadsTo = cfg.leadsTo;
        this.$el = $("<div>")
            .addClass("smash-bracket");
        this.$title = $("<div>")
            .addClass("smash-bracket-title")
            .text(this.title);
        this.$slotContainer = $("<div>")
            .addClass("smash-bracket-slot-container");
        
        for (var i = 0; i < this.slots.length; i++) {
            this.slots[i].attachTo(this.$slotContainer);
            this.slots[i].setLeadsTo(this.leadsTo);
        }
        
        this.$el.append(this.$title, this.$slotContainer);
    }
    
    BracketGroup.prototype = {
        setTitle(title) {
            this.title = title;
            this.$title.text(this.title);
        },
        setLeadsTo(leadsTo) {
            this.leadsTo = leadsTo;
            for (var i = 0; i < this.slots.length; i++) {
                this.slots[i].setLeadsTo(this.leadsTo);
            }
        },
        addSlot(slot) {
            slot.setLeadsTo(this.leadsTo);
            this.slots.push(slot);
            slot.attachTo(this.$slotContainer);
        },
        attachTo($el) {
            $el.append(this.$el);
        }
    };
    
    
    
    function BracketLayer(cfg) {
        this.groups = cfg.groups || [];
        this.title = cfg.title;
        this.$title = $("<div>")
            .addClass("smash-bracket-layer-title")
            .text(this.title);
        this.$groupContainer = $("<div>")
            .addClass("smash-bracket-layer-container");
        this.$el = $("<div>")
            .addClass("smash-bracket-layer");
        
        for (var i = 0; i < this.groups.length; i++) {
            this.groups[i].attachTo(this.$groupContainer);
        }
    
        this.$el.append(this.$title, this.$groupContainer);
    }
    
    BracketLayer.prototype = {
        setTitle(title) {
            this.title = title;
            this.$title.text(this.title);
        },
        setX(x) {
            this.$el.css({
                left: x
            });
        },
        addGroup(group) {
            this.groups.push(group);
            group.attachTo(this.$groupContainer);
        },
        attachTo($el) {
            $el.append(this.$el);
        }
    };
    
    
    
    function BracketTree(cfg) {
        this.layers = cfg.layers || [];
        this.title = cfg.title || "";
        this.$title = $("<div>")
            .addClass("smash-bracket-tree-title")
            .text(this.title);
        this.$layerContainer = $("<div>")
            .addClass("smash-bracket-layer-container");
        this.$el = $("<div>").addClass("smash-bracket-tree");
        
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].attachTo(this.$layerContainer);
        }
        
        this.$el.append(this.$title, this.$layerContainer);
    }
    
    BracketTree.prototype = {
        setTitle(title) {
            this.title = title;
            this.$title.text(this.title);
        },
        addLayer(layer) {
            return this.addLayers(layer);
        },
        addLayers(layers) {
            if (!layers || layers.constructor !== Array) {
                layers = [layers];
            }
            
            layers = layers.filter(function(layer) {
                return (typeof layer === "object" &&
                    typeof layer.attachTo === "function");
            }).map(function(layer) {
                this.layers.push(layer);
                layer.attachTo(this.$layerContainer);
            }.bind(this));
            
            return this;
        },
        attachTo($el) {
            $el.append(this.$el);
        }
    };
    
    return {
        Tree: BracketTree,
        Layer: BracketLayer,
        Group: BracketGroup,
        Slot: BracketSlot
    }
    
})();



function getURLParams() {
    var params = (window.location.href.split("?")[1] || "").split("&");
    var paramsJSON = {};
    
    for (var i = 0; i < params.length; i++) {
        var paramData = params[i].split("=");
        if (!paramData[1]) {
            paramData[1] = true;
        }
        if (paramData[0].length > 0) {
            paramsJSON[paramData[0]] = paramData[1];
        }
    }
    
    return paramsJSON;
}



(function() {
    
    var players = (getURLParams().players || "").split(",");
    
    var layers = [];
    
    var n = 1;
    
    do {
        var layer = new Bracket.Layer({});
        for (var i = 0; i < n; i++) {
            var leadsTo;
            if (layers.length) {
                var leadsBracket = layers[0].groups[Math.floor(i / 2)];
                if (leadsBracket) {
                    leadsTo = leadsBracket.slots[i % 2];
                }
            }
            layer.addGroup(new Bracket.Group({
                slots: [
                    new Bracket.Slot({}),
                    new Bracket.Slot({})
                ],
                leadsTo: leadsTo
            }));
        }
        layers.unshift(layer);
        n *= 2;
    } while (n <= players.length)
    
    for (var i = 0; i < layers.length; i++) {
        layers[i].setX(36 * i + "em");
    }
    
    layers[0].groups = layers[0].groups.map(function(group, index) {
        group.slots[0].setPlayer(players[index * 2] || "AI");
        group.slots[1].setPlayer(players[index * 2 + 1] || "AI");
    });
    
    var bracketTree = new Bracket.Tree({
        title: "Smash Bros Tourney 2K16"
    });
    
    var $container = $(".smash-bracket-container");
    
    bracketTree.addLayers(layers);
    
    $container.css("height", players.length * 14 + "em");
    
    bracketTree.attachTo($container);
    
})();
