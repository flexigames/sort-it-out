import {
  Engine,
  Composite,
  Bodies,
  Body,
  Mouse,
  MouseConstraint,
  Runner,
} from 'matter-js';
import kaboom, { Comp, PosComp, RotateComp } from 'kaboom';

const engine = Engine.create({ gravity: { scale: 0 } });

const k = kaboom({
  global: false,
  width: 600,
  height: 600,
  background: [230, 210, 210],
});

const mouse = Mouse.create(k.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
  },
});

Composite.add(engine.world, mouseConstraint);

k.add([
  k.pos(40, 40),
  k.rect(50, 50),
  k.anchor('center'),
  k.color(170, 100, 100),
  matterRect(),
  k.rotate(0),
]);

Runner.run(engine);

type MatterRectComp = {
  body?: Body;
} & PosComp &
  RotateComp;

function matterRect(): Comp {
  return {
    require: ['pos', 'rotate'],
    add(this: MatterRectComp) {
      const { x, y } = this.pos;
      this.body = Bodies.rectangle(x, y, 50, 50);

      Composite.add(engine.world, this.body);
    },
    update(this: MatterRectComp) {
      if (!this.body) return;

      this.pos.x = this.body.position.x;
      this.pos.y = this.body.position.y;
      this.angle = (this.body.angle * 180) / Math.PI;
    },
    destroy(this: MatterRectComp) {
      if (!this.body) return;

      Composite.remove(engine.world, this.body);
    },
  };
}

Composite.add(engine.world, [
  Bodies.rectangle(300, -20, 600, 40, { isStatic: true }),
  Bodies.rectangle(300, 600 + 20, 600, 40, { isStatic: true }),
  Bodies.rectangle(-20, 300, 40, 600, { isStatic: true }),
  Bodies.rectangle(600 + 20, 300, 40, 600, { isStatic: true }),
]);

Mouse.setScale(mouse, {
  x: 0.5,
  y: 0.5,
});

Mouse.setOffset(mouse, { x: 0, y: 0 });
