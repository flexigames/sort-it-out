import {
  Engine,
  Render,
  Runner,
  MouseConstraint,
  Mouse,
  Composite,
  Bodies,
  Detector,
} from 'matter-js';

const engine = Engine.create({
  gravity: {
    scale: 0,
  },
});
const world = engine.world;

const render = Render.create({
  element: document.body,
  engine,
  options: {
    width: 800,
    height: 600,
    showAngleIndicator: true,
  },
});

Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

const item = Bodies.rectangle(100, 100, 50, 50);
Composite.add(world, item);

const bucket = Bodies.circle(300, 300, 100, { isStatic: true, isSensor: true });
Composite.add(world, bucket);

Composite.add(world, [
  Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
  Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
  Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
  Bodies.rectangle(0, 300, 50, 600, { isStatic: true }),
]);

const mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  });

Composite.add(world, mouseConstraint);

render.mouse = mouse;

Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: 800, y: 600 },
});

const detector = Detector.create({});
Detector.setBodies(detector, [item, bucket]);

function gameLoop() {
  const collisions = Detector.collisions(detector);
  console.log(collisions);
  // if (Collision.collides(item, bucket, Pairs.create({}))) {
  // console.log('collision');
  // Composite.remove(world, item);
  // }
  requestAnimationFrame(gameLoop);
}

gameLoop();
