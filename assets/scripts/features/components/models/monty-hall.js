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
    const controller = new AbortController();
    const { signal } = controller;
    const status = element('p', 'interactive-component__status', '先选择一扇门。主持人会按照标准规则打开一扇空门。');
    status.setAttribute('aria-live', 'polite');
    const doors = element('div', 'interactive-component__doors');
    const message = element('p', 'interactive-component__note');
    message.setAttribute('aria-live', 'polite');
    const actions = element('div', 'interactive-component__actions');
    const reveal = createButton('请主持人开门');
    const stay = createButton('坚持原选', 'button button--secondary');
    const change = createButton('改选另一扇门', 'button button--primary');
    reveal.disabled = true;
    stay.disabled = true;
    change.disabled = true;
    actions.append(reveal, stay, change);

    const batchControls = element('div', 'interactive-component__batch');
    const trials = Number(config.trials ?? 10000);
    const batchButton = createButton(`运行 ${trials.toLocaleString('zh-CN')} 次模拟`);
    const totals = element('dl', 'interactive-component__stats');
    const comparison = element('div', 'interactive-component__comparison');
    const stayBar = element('div', 'interactive-component__comparison-bar interactive-component__comparison-bar--stay');
    const switchBar = element('div', 'interactive-component__comparison-bar interactive-component__comparison-bar--switch');
    comparison.append(stayBar, switchBar);
    const stayValue = element('dd', null, '—');
    const switchValue = element('dd', null, '—');
    totals.append(
      element('dt', null, '坚持胜率（理论 1/3）'), stayValue,
      element('dt', null, '换门胜率（理论 2/3）'), switchValue,
    );
    batchControls.append(batchButton, comparison, totals);
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
        button.addEventListener('click', () => selectDoor(door), { signal });
        doors.append(button);
      }
    }

    function selectDoor(door) {
      if (choice !== -1 || roundDone) return;
      choice = door;
      prize = Math.floor(Math.random() * 3);
      status.textContent = `你选择了门 ${choice + 1}。先让主持人打开一扇未被选择的空门。`;
      paintDoors();
      reveal.disabled = false;
    }

    reveal.addEventListener('click', () => {
      if (choice === -1 || opened !== -1) return;
      opened = hostDoor(prize, choice);
      status.textContent = `主持人打开了门 ${opened + 1}。现在选择坚持或换门。`;
      reveal.disabled = true;
      stay.disabled = false;
      change.disabled = false;
      paintDoors();
    }, { signal });

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
      message.textContent = choice === prize
        ? '初选正中奖品（这类情况约占 1/3），坚持会赢，换门会输。'
        : '初选没有选中奖品（这类情况约占 2/3），主持人排除空门后，换门会赢。';
      paintDoors(true, finalChoice);
      const next = createButton('再玩一次');
      next.addEventListener('click', () => {
        choice = -1;
        prize = -1;
        opened = -1;
        roundDone = false;
        reveal.disabled = true;
        stay.disabled = true;
        change.disabled = true;
        status.textContent = '先选择一扇门。主持人会打开一扇空门。';
        message.textContent = '';
        paintDoors();
        next.remove();
      }, { once: true, signal });
      actions.append(next);
    }

    stay.addEventListener('click', () => finishRound(false), { signal });
    change.addEventListener('click', () => finishRound(true), { signal });
    batchButton.addEventListener('click', () => {
      const result = runBatch(trials);
      stayValue.textContent = `${formatPercent(result.stayWins / result.trials)}（${result.stayWins} / ${result.trials}）`;
      switchValue.textContent = `${formatPercent(result.switchWins / result.trials)}（${result.switchWins} / ${result.trials}）`;
      stayBar.style.width = `${result.stayWins / result.trials * 100}%`;
      switchBar.style.width = `${result.switchWins / result.trials * 100}%`;
      stayBar.setAttribute('aria-label', `坚持胜率 ${formatPercent(result.stayWins / result.trials)}`);
      switchBar.setAttribute('aria-label', `换门胜率 ${formatPercent(result.switchWins / result.trials)}`);
    }, { signal });
    paintDoors();
    return () => controller.abort();
  },
};
