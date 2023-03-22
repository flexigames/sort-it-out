import {
  Engine,
  Composite,
  Bodies,
  Body,
  Mouse,
  MouseConstraint,
  Runner,
} from "matter-js";
import kaboom, { Comp, PosComp, RectComp, RotateComp, TextComp } from "kaboom";
import { sample } from "lodash";

const engine = Engine.create({ gravity: { scale: 0 } });

const k = kaboom({
  global: false,
  width: 600,
  height: 600,
  background: [210, 240, 240],
});

const colorMap = {
  red: k.Color.fromHex("#EB1F26"),
  blue: k.Color.fromHex("#05A8DC"),
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
  k.text("0"),
  k.pos(k.width() / 2, 40),
  k.anchor("center"),
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
    "item",
    { colorId },
    k.pos(40, k.height() / 2),
    k.rect(32, 32),
    k.anchor("center"),
    k.color(colorMap[colorId]),
    matterRect(startVelocity),
    k.area(),
    k.rotate(0),
  ]);

  item.onCollide("bucket-" + colorId, () => {
    item.destroy();
    score.score++;
  });
}

let timeBetweenSpawnsInSeconds = 3;
function spawn() {
  spawnItem();
  setTimeout(spawn, timeBetweenSpawnsInSeconds * 1000);
}

spawn();

addBucket("red", { x: k.width() - 100, y: k.height() / 2 - 150 });
addBucket("blue", { x: k.width() - 100, y: k.height() / 2 + 150 });

addMinion();

type Position = {
  x: number;
  y: number;
};

type ColorId = keyof typeof colorMap;

function addBucket(colorId: ColorId, position: Position) {
  k.add([
    "bucket",
    "bucket-" + colorId,
    colorId,
    k.pos(position.x, position.y),
    k.rect(100, 100),
    k.anchor("center"),
    k.color(colorMap[colorId]),
    k.area(),
  ]);
}

function addMinion() {
  const position = { x: 40, y: k.height() / 2 };
  const speed = 1;
  const minion = k.add([
    "minion",
    k.pos(position.x, position.y),
    k.circle(12),
    k.anchor("center"),
    k.color(0, 0, 0),
    k.area(),
    k.rotate(0),
    {
      update: () => {
        const closestItem = k.get("item").sort((a, b) => {
          const aDist = Math.sqrt(
            Math.pow(a.pos.x - minion.pos.x, 2) +
              Math.pow(a.pos.y - minion.pos.y, 2)
          );
          const bDist = Math.sqrt(
            Math.pow(b.pos.x - minion.pos.x, 2) +
              Math.pow(b.pos.y - minion.pos.y, 2)
          );
          return aDist - bDist;
        })[0];

        if (!closestItem) return;

        const distance = Math.sqrt(
          Math.pow(closestItem.pos.x - minion.pos.x, 2) +
            Math.pow(closestItem.pos.y - minion.pos.y, 2)
        );

        const colorId = closestItem.colorId;
        const targetBucket = k.get("bucket-" + colorId)[0];

        if (distance < 5) {
          const angleToBucket =
            Math.atan2(
              targetBucket.pos.y - minion.pos.y,
              targetBucket.pos.x - minion.pos.x
            ) + k.rand(-0.1, 0.1);

          closestItem.body.force = {
            x: Math.cos(angleToBucket) * 0.01,
            y: Math.sin(angleToBucket) * 0.01,
          };
        }

        const angle = Math.atan2(
          closestItem.pos.y - minion.pos.y,
          closestItem.pos.x - minion.pos.x
        );
        minion.pos.x += Math.cos(angle) * speed;
        minion.pos.y += Math.sin(angle) * speed;
      },
    },
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
    require: ["pos", "rotate", "rect"],
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

document.querySelector("#button-spawn-rate")?.addEventListener("click", () => {
  if (score.score >= 5) {
    console.log("Upgrade bought");
    score.score -= 5;
    timeBetweenSpawnsInSeconds *= 0.7;
  } else {
    alert("Not enough cash :(");
  }
});
