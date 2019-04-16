let TextureCache = PIXI.utils.TextureCache,
    Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;


let renderer = autoDetectRenderer(240, 160, {antialias: true, transparent: false, resolution: 2});

document.body.appendChild(renderer.view);


let stage = new Container();

renderer.render(stage);


loader
    .add('/client/img/tiles.png')
    .on("progress", loadProgressHandler)
    .load(setup);

function setup() {
    let tileSheet = new Sprite(resources["/client/img/tiles.png"].texture);
    stage.addChild(tileSheet);
    tileSheet.x = 10;
    tileSheet.y = 10;
    renderer.render(stage);
}

function loadProgressHandler(loader, resource) {
    console.log(`loading: ${resource.url}`);
    console.log(`progress: ${loader.progress}%`);
}