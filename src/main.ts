import {
  Engine,
  Composite,
  Bodies,
  Body,
  Mouse,
  MouseConstraint,
  Runner,
} from 'matter-js';
import kaboom, { Comp, PosComp, RectComp, RotateComp, TextComp, Color } from 'kaboom';
import { sample } from 'lodash';

const engine = Engine.create({ gravity: { scale: 0 } });

const k = kaboom({
  global: false,
  width: 600,
  height: 600,
  background: [210, 240, 240],
});

const colorMap = {
  red: k.Color.fromHex('#EB1F26'),
  blue: k.Color.fromHex('#05A8DC'),
};

const mouse = Mouse.create(k.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
  },
});

Composite.add(engine.world, mouseConstraint);

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

function spawnItem() {
  const startVelocity = 0.005;
  const colorId = sample(Object.keys(colorMap)) as ColorId;
  const item = k.add([
    'item',
    k.pos(40, k.height() / 2),
    k.rect(32, 32),
    k.anchor('center'),
    k.color(colorMap[colorId]),
    matterRect(startVelocity),
    k.area(),
    k.rotate(0),
  ]);

  item.onCollide('bucket-' + colorId, () => {
    item.destroy();
    score.score++;
  });
}

spawnItem();
setInterval(spawnItem, 1000);

addBucket('red', { x: k.width() - 100, y: k.height() / 2 - 150 });
addBucket('blue', { x: k.width() - 100, y: k.height() / 2 + 150 });

type Position = {
  x: number;
  y: number;
};

type ColorId = keyof typeof colorMap;

function addBucket(colorId: ColorId, position: Position) {
  k.add([
    'bucket',
    'bucket-' + colorId,
    colorId,
    k.pos(position.x, position.y),
    k.rect(100, 100),
    k.anchor('center'),
    k.color(colorMap[colorId]),
    k.area(),
  ]);
}

Runner.run(engine);

type MatterRectContext = {
  body?: Body;
} & PosComp &
  RotateComp &
  RectComp;

interface MatterRectComp extends Comp {
  body?: Body;
}

function matterRect(startVelocity: number): MatterRectComp {
  return {
    require: ['pos', 'rotate', 'rect'],
    add(this: MatterRectContext) {
      const { x, y } = this.pos;
      this.body = Bodies.rectangle(x, y, this.width, this.height);
      this.body.force = { x: startVelocity, y: (Math.random() - 0.5) / 100 };

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
