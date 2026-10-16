import { createButton, createShell, element, formatPercent } from '@/features/components/shared.js';

function hostDoor(prize, choice) {
  const goats = [0, 1, 2].filter((door) => door !== prize && door !== choice);
  return goats[Math.floor(Math.random() * goats.length)];
}

function runBatch(trials) {
  let stayWins = 0;
  let switchWins = 0;
  for (let i = 0; i < trials; i += 1) {
    const prize = Math.floor(Math.random() * 3);
    const choice = Math.floor(Math.random() * 3);
    const opened = hostDoor(prize, choice);
    const switched = [0, 1, 2].find((door) => door !== choice && door !== opened);
    if (choice === prize) stayWins += 1;
    if (switched === prize) switchWins += 1;
  }
  return { trials, stayWins, switchWins };
}

export const montyHallModel = {
  validate(config) {
    const trials = Number(config.trials ?? 10000);
    if (!Number.isInteger(trials) || trials < 100 || trials > 100000) {
      throw new Error('批量模拟次数必须介于 100 到 100000。');
    }
  },

  mount(root, config) {
    const content = createShell(root, config);
    const status = element('p', 'interactive-component__status', '先选择一扇门。主持人会按照标准规则打开一扇空门。');
    status.setAttribute('aria-live', 'polite');
    const doors = element('div', 'interactive-component__doors');
    const message = element('p', 'interactive-component__note');
    message.setAttribute('aria-live', 'polite');
    const actions = element('div', 'interactive-component__actions');
    const stay = createButton('坚持原选', 'button button--secondary');
    const change = createButton('改选另一扇门', 'button button--primary');
    stay.disabled = true;
    change.disabled = true;
    actions.append(stay, change);

    const batchControls = element('div', 'interactive-component__batch');
    const trials = Number(config.trials ?? 10000);
    const batchButton = createButton(`运行 ${trials.toLocaleString('zh-CN')} 次模拟`);
    const totals = element('dl', 'interactive-component__stats');
    const stayValue = element('dd', null, '—');
    const switchValue = element('dd', null, '—');
    totals.append(
      element('dt', null, '坚持胜率（理论 1/3）'), stayValue,
      element('dt', null, '换门胜率（理论 2/3）'), switchValue,
    );
    batchControls.append(batchButton, totals);
    content.append(status, doors, message, actions, batchControls);

    let prize = -1;
    let choice = -1;
    let opened = -1;
    let roundDone = false;

    function paintDoors(reveal = false, finalChoice = -1) {
      doors.replaceChildren();
      for (let door = 0; door < 3; door += 1) {
        const button = createButton(`门 ${door + 1}`, 'interactive-component__door');
        if (door === choice) button.dataset.selected = 'true';
        if (door === opened) {
          button.textContent = '空门已打开';
          button.disabled = true;
        } else if (reveal && door === prize) {
          button.textContent = '奖品';
          button.dataset.prize = 'true';
          button.disabled = true;
        } else if (reveal) {
          button.textContent = '空门';
          button.disabled = true;
        }
        if (door === finalChoice) button.dataset.final = 'true';
        button.addEventListener('click', () => selectDoor(door));
        doors.append(button);
      }
    }

    function selectDoor(door) {
      if (choice !== -1 || roundDone) return;
      choice = door;
      prize = Math.floor(Math.random() * 3);
      opened = hostDoor(prize, choice);
      status.textContent = `你选择了门 ${choice + 1}；主持人打开了门 ${opened + 1}。现在可以坚持或换门。`;
      paintDoors();
      stay.disabled = false;
      change.disabled = false;
    }

    function finishRound(switchDoor) {
      if (choice === -1 || roundDone) return;
      const finalChoice = switchDoor
        ? [0, 1, 2].find((door) => door !== choice && door !== opened)
        : choice;
      const won = finalChoice === prize;
      roundDone = true;
      stay.disabled = true;
      change.disabled = true;
      status.textContent = `你${switchDoor ? '改选' : '坚持选择'}了门 ${finalChoice + 1}，${won ? '赢得奖品。' : '没有赢得奖品。'}`;
      message.textContent = '主持人只会打开未被选择且没有奖品的门；若初选正中奖品，空门由主持人随机选择。';
      paintDoors(true, finalChoice);
      const next = createButton('再玩一次');
      next.addEventListener('click', () => {
        choice = -1;
        prize = -1;
        opened = -1;
        roundDone = false;
        stay.disabled = true;
        change.disabled = true;
        status.textContent = '先选择一扇门。主持人会打开一扇空门。';
        message.textContent = '';
        paintDoors();
        next.remove();
      }, { once: true });
      actions.append(next);
    }

    stay.addEventListener('click', () => finishRound(false));
    change.addEventListener('click', () => finishRound(true));
    batchButton.addEventListener('click', () => {
      const result = runBatch(trials);
      stayValue.textContent = `${formatPercent(result.stayWins / result.trials)}（${result.stayWins} / ${result.trials}）`;
      switchValue.textContent = `${formatPercent(result.switchWins / result.trials)}（${result.switchWins} / ${result.trials}）`;
    });
    paintDoors();
  },
};
