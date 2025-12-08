var defEntities = {}
var defItems = {}

//     ENTITIES    //
defEntities.player = {
    COLOR: "#0069FF",
    TEAM: 1,
    FOV: 1,
    FACING_TYPE: "player",
    IS_PLAYER: true,
    SHOW_HEALTH_BAR: true,
    IFRAMES: 10,
    IFRAME_LENGTH: 5
}


defEntities.ball = {

}
defEntities.ghost = {
    RADIUS: 50,
    COLOR: "#ffffff",
    ALPHA: 0.5,
    ENTRY: "188",
    //LABEL: "Ghost",
    ONLY_DAMAGE_ON_COLLIDE: true,
    MASS: 0,
    IFRAME_LENGTH: 10,
    MAX_HEALTH: 1000,
    IFRAME_FACTOR: 10,
    DAMAGE: 2
}

defEntities.lunaria = {
    TEXTURE: "lunaria.jpg",
    FACING_TYPE: "autospin",
    RADIUS: 100,
    ENTRY: "104"
}

//  ITEMS  //

defItems.shootTest = {
    LABEL: "Shoot Test",
    LABEL_COLOR: "#123456",
    TEXTURE: "lunaria_item.jpg",
    ON_USE: (me, player) => {
        console.log("I Got Used")
        me.shoot(player)
    }
}

export {defEntities, defItems}