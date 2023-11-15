import { Bodies, Engine, Render, Runner, World, Body, Events } from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  },
});

const world = engine.world;

// 왼쪽벽 rectangle(x, y, 가로길이, 세로길이)
const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true, // 왼쪽벽 고정
  render: { fillStyle: "#E6B143" },
});

// 오른쪽벽
const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" },
});

// 아래쪽벽
const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" },
});

// 중간 경계라인
const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true, // 부딪치지 않고 감지만 한다
  render: { fillStyle: "#E6B143" },
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;

function addFruit() {
  //const index = 7;
  const index = Math.floor(Math.random() * 7); // 랜덤
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true, // 준비중 상태로 ( 내려오지 않고 준비중 상태로 고정 )as
    render: {
      sprite: { texture: `${fruit.label}.png` },
    },
    restitution: 0.3, // 탄성 (통통튀는값 0~1 사이값)
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

//    W
//  A S D
window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.code) {
    case "KeyA": // left key
      if (currentBody.position.x - currentFruit.radius > 30) {
        //벽안쪽으로만 이동
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 10,
          y: currentBody.position.y,
        });
      }
      break;
    case "KeyD": // right key
      if (currentBody.position.x + currentFruit.radius < 590) {
        //벽안쪽으로만 이동
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 10,
          y: currentBody.position.y,
        });
      }
      break;
    case "KeyS": // down key
      currentBody.isSleeping = false;
      disableAction = true;
      setTimeout(() => {
        // 1초 뒤에 실행
        addFruit();
        disableAction = false;
      }, 500);
      break;
    case "KeyW":
      Body.setPosition(currentBody, {
        x: currentBody.position.x - 10,
        y: currentBody.position.y,
      });
      break;
  }
};

Events.on(engine, "collisionStart", (event) => {
  // 엔진 업데이트 후 실행되며, 현재 틱(있는 경우)에서 충돌하기 시작한 모든 쌍의 목록을 제공합니다.
  // 충돌했을 경우 실행
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;
      World.remove(world, [collision.bodyA, collision.bodyB]);
      const newFruit = FRUITS[index + 1];
      const newBody = Bodies.circle(
        collision.collision.supports[0].x, // 부딪친 지점의 x좌표
        collision.collision.supports[0].y, // 부딪친 지점의 y좌표
        newBody.radius,
        {
          render: {
            sprite: { texture: `${newFruit.label}.png` },
          },
          index: index + 1,
        }
      );

      World.add(world, newBody);
    }

    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")
    ) {
      alert("Game Over");
    }
  });
});

addFruit();
