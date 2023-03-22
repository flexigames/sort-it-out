import {
  Engine,
  Composite,
  Bodies,
  Body,
  Mouse,
  MouseConstraint,
  Runner,
} from 'matter-js';
import kaboom, { Comp, PosComp, RectComp, RotateComp, TextComp } from 'kaboom';

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

const item = k.add([
  'item',
  k.pos(40, k.height() / 2),
  k.rect(32, 32),
  k.anchor('center'),
  k.color(170, 100, 100),
  matterRect(),
  k.area(),
  k.rotate(0),
]);

const score = k.add([
  k.text('0'),
  k.pos(k.width() / 2, 40),
  k.anchor('center'),
  k.color(0, 0, 0),
  {
    score: 0,
    update(this: TextComp & { score: number }) {
      this.text = this.score.toString();
    },
  },
]);

item.onCollide('bucket', () => {
  item.destroy();
  score.score++;
});

k.add([
  'bucket',
  k.pos(k.width() - 100, k.height() / 2),
  k.rect(100, 100),
  k.anchor('center'),
  k.color(200, 150, 240),
  k.area(),
]);

Runner.run(engine);

type MatterRectContext = {
  body?: Body;
} & PosComp &
  RotateComp &
  RectComp;

interface MatterRectComp extends Comp {
  body?: Body;
}

function matterRect(): MatterRectComp {
  return {
    require: ['pos', 'rotate', 'rect'],
    add(this: MatterRectContext) {
      const { x, y } = this.pos;
      this.body = Bodies.rectangle(x, y, this.width, this.height);

      Composite.add(engine.world, this.body);
    },
    update(this: MatterRectContext) {
      if (!this.body) return;

      this.pos.x = this.body.position.x;
      this.pos.y = this.body.position.y;
      this.angle = (this.body.angle * 180) / Math.PI;
    },
    destroy(this: MatterRectContext) {
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
