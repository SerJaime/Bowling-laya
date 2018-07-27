//初始化引擎
Laya3D.init(0, 0,true);
Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
Laya.Stat.show();

//预加载资源
Laya.loader.create(["LayaScene_baoling/Assets/baolingqiu-Sphere001[10426].lm","LayaScene_gun/Assets/gun-Line001[10448].lm"],Laya.Handler.create(this,onComplete));

var camera;

var baoling;
var velocity=80;
var gun=[];
var world;
var dt = 1 / 60;

var N = 40;

// To be synced
var meshes=[], bodies=[];

function onComplete(){
    initCannon();
    init();
    Laya.timer.frameLoop(dt, this, updatePhysics);
}

function init(){
    var scene = Laya.stage.addChild(new Laya.Scene());
    //设置摄像机
    camera= scene.addChild(new Laya.Camera( 0, 0.1, 110));
    camera.transform.position=new Laya.Vector3(3, 15, 60);
    camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);

    camera.addComponent(CameraMoveScript);

    //添加方向光
    var directionLight = scene.addChild(new Laya.DirectionLight());
    directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
    directionLight.direction = new Laya.Vector3(1, -1, -1);

    //平面
    var plane = scene.addChild(new Laya.MeshSprite3D(new Laya.PlaneMesh(100, 100, 100, 100)));
    var planeMat = new Laya.StandardMaterial();
    //planeMat.diffuseTexture = Laya.Texture2D.load("plane.png");
    planeMat.albedo = new Laya.Vector4(1, 1, 1.3, 1);
    plane.meshRender.material = planeMat;

    //保龄球
    baoling=new Laya.MeshSprite3D(Laya.loader.getRes("LayaScene_baoling/Assets/baolingqiu-Sphere001[10426].lm"));
    baoling.transform.localScale = new Laya.Vector3(0.4, 0.4, 0.4);
    var baolingMat = new Laya.StandardMaterial();
    baolingMat.albedo = new Laya.Vector4(0.8, 0, 0, 1);
    baoling.meshRender.material = baolingMat;
    meshes.push(baoling);
    scene.addChild(baoling);

    for(var i=0;i<10;i++){
        gun[i]=new Laya.MeshSprite3D(Laya.loader.getRes("LayaScene_gun/Assets/gun-Line001[10448].lm"));
        gun[i].transform.localScale = new Laya.Vector3(2, 2, 2);
        meshes.push(gun[i]);
        scene.addChild(gun[i]);
    }
}

function initCannon(){
    // Setup our world
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    world.gravity.set(0,-10,0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(groundBody);

    var guns=[];
    baolingShape = new CANNON.Sphere(1.5);
    baolingBody = new CANNON.Body({ mass: 50 });
    baolingBody.addShape(baolingShape);
    baolingBody.position.set(3,1.6,45);
    world.addBody(baolingBody);
    bodies.push(baolingBody);
    var layaCanvas=document.getElementById("layaCanvas");
    document.addEventListener("click",function(event){
		var target = event.target;
    //console.log(target);
    baolingBody.velocity.set(0,0,-velocity);
		
		});
    document.addEventListener("touchend",function(event){
		var target = event.target;
    //console.log(target);
    baolingBody.velocity.set(0,0,-velocity);
		
		});

    for(var i=0;i<10;i++){
      guns[i] = new CANNON.Body({ mass: 5 });
    }

    var shape1 = new CANNON.Cylinder(0.8,0.8,1.6,10);
    var shape2 = new CANNON.Cylinder(0.3,0.6,1.6,10);
    var shape3 = new CANNON.Cylinder(0.3,0.3,0.8,10);
    var shape4 = new CANNON.Sphere(0.4);

    for(var i=0;i<10;i++){
      guns[i].addShape(shape1,new CANNON.Vec3( 0, -1.6, 0));
      guns[i].addShape(shape2,new CANNON.Vec3( 0, 0, 0));
      guns[i].addShape(shape3,new CANNON.Vec3( 0, 1.2, 0));
      guns[i].addShape(shape4,new CANNON.Vec3( 0, 2, 0));
    }
          
    for(var i=0;i<4;i++){
      guns[i].position.set(3*i,2.4,0-40);
      world.addBody(guns[i]);
      bodies.push(guns[i]);
    }
    for(var i=4;i<7;i++){
      guns[i].position.set(1.5+3*(i-4),2.4,3-40);
      world.addBody(guns[i]);
      bodies.push(guns[i]);
    }
    for(var i=7;i<9;i++){
      guns[i].position.set(3+3*(i-7),2.4,6-40);
      world.addBody(guns[i]);
      bodies.push(guns[i]);
    }
    guns[9].position.set(4.5,2.4,9-40);
    world.addBody(guns[9]);
    bodies.push(guns[9]);

}

function updatePhysics(){
    world.step(dt);
    for(var i=0; i !== meshes.length; i++){
        meshes[i].transform.position=new Laya.Vector3(bodies[i].position.x,bodies[i].position.y,bodies[i].position.z);
        meshes[i].transform.rotation=new Laya.Quaternion(bodies[i].quaternion.x,bodies[i].quaternion.y,bodies[i].quaternion.z,bodies[i].quaternion.w);
    }
}

