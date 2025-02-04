const renameBtn = document.getElementById('renameBtn');
renameBtn.addEventListener('click', renameDimension);

function renameDimension() {
  const renameErr = document.getElementById('renameErr');
  const dimSelect = document.getElementById('dimensionSelect');
  const mainLabelEl = document.getElementById('mainLabel');
  const oppLabelEl = document.getElementById('oppLabel');

  const dimIndex = parseInt(dimSelect.value, 10);
  const mainLabel = mainLabelEl.value.trim();
  const oppLabel = oppLabelEl.value.trim();

  if (!mainLabel || !oppLabel) {
    renameErr.textContent = 'Please provide both main label and opposite label.';
    return;
  }
  renameErr.textContent = '';

  const progressContainer = document.getElementById('renameProgressContainer');
  const progressBar = document.getElementById('renameProgressBar');
  const progressText = document.getElementById('renameProgressText');

  progressContainer.classList.remove('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = 'Starting...';

  let serverDone = false;
  let stepsDone = false;

  fetch('/rename_dimension', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mainLabel, oppLabel, dimIndex })
  })
  .then(res => res.json())
  .then(() => {
    serverDone = true;
    if (stepsDone) finalizeRename(dimIndex, mainLabel);
  })
  .catch(err => console.error(err));

  let currentStep = 0;
  const totalSteps = 11;
  const stepTimes = Array(10).fill(200).concat([500]); // 2.5s total

  function doStep() {
    if (currentStep < totalSteps) {
      const stepDuration = stepTimes[currentStep];
      if (currentStep < 10) {
        progressText.textContent = `Constructing pair ${currentStep + 1}/10...`;
      } else {
        progressText.textContent = 'Running PCA...';
      }
      const newWidth = Math.round(((currentStep + 1) / totalSteps) * 100);
      progressBar.style.width = newWidth + '%';
      currentStep++;
      setTimeout(doStep, stepDuration);
    } else {
      stepsDone = true;
      if (serverDone) finalizeRename(dimIndex, mainLabel);
    }
  }
  doStep();
}

function finalizeRename(dimIndex, mainLabel) {
  window.dimensions[dimIndex].name = mainLabel;
  const selectEl = document.getElementById('dimensionSelect');
  selectEl.options[dimIndex].text = mainLabel;

  updateSelectedText();

  const progressContainer = document.getElementById('renameProgressContainer');
  progressContainer.classList.add('hidden');

  document.getElementById('mainLabel').value = '';
  document.getElementById('oppLabel').value = '';
}
