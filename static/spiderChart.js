// Global array of dimension objects
window.dimensions = [
    { name: 'D1', value: 1.0, enabled: true, layer: -5 },
    { name: 'D2', value: 2.5, enabled: true, layer: -5 },
    { name: 'D3', value: 3.0, enabled: true, layer: -5 },
    { name: 'D4', value: 4.0, enabled: true, layer: -5 },
    { name: 'D5', value: 2.0, enabled: true, layer: -5 },
  ];
  
  const width = 400;
  const height = 400;
  const radius = 150;
  const centerX = width / 2;
  const centerY = height / 2;
  const angleSlice = (2 * Math.PI) / dimensions.length;
  
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  const scale = d3.scaleLinear().domain([0, 10]).range([0, radius]);
  
  function getCoordinate(i, val) {
    const angle = angleSlice * i - Math.PI / 2;
    const r = scale(val);
    return { x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) };
  }
  
  const levels = [3, 6, 10];
  const grid = svg.append('g');
  levels.forEach((lvl, idx) => {
    const ringPoints = dimensions.map((_, i) => getCoordinate(i, lvl));
    const ringPath = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveLinearClosed)(ringPoints);
    grid.append('path')
      .attr('d', ringPath)
      .attr('fill', 'none')
      .attr('stroke', idx === levels.length - 1 ? '#666' : '#ccc')
      .attr('stroke-width', idx === levels.length - 1 ? 1.5 : 1);
  });
  
  svg.selectAll('.axis')
    .data(dimensions)
    .enter()
    .append('line')
    .attr('class', 'axis')
    .attr('x1', centerX)
    .attr('y1', centerY)
    .attr('x2', (d, i) => getCoordinate(i, 10).x)
    .attr('y2', (d, i) => getCoordinate(i, 10).y)
    .attr('stroke', '#ccc');
  
  let polygon = svg.append('path')
    .attr('fill', '#10b981')
    .attr('fill-opacity', 0.2)
    .attr('stroke', '#10b981')
    .attr('stroke-width', 2);
  
  function updateRadar() {
    const lineGenerator = d3.line()
      .x((d, i) => getCoordinate(i, d.value).x)
      .y((d, i) => getCoordinate(i, d.value).y)
      .curve(d3.curveLinearClosed);
    polygon.datum(dimensions).attr('d', lineGenerator);
  }
  
  window.updateSelectedText = function () {
    let rows = dimensions.map((d, i) => {
      let layerOptions = '';
      for (let layerVal = -5; layerVal >= -20; layerVal--) {
        layerOptions += `<option value="${layerVal}" ${
          d.layer === layerVal ? 'selected' : ''
        }>${layerVal}</option>`;
      }
      return `
        <tr>
          <td class="pr-4 text-sm">
            <strong>${d.name}</strong>: ${d.value}
          </td>
          <td>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                id="toggle-${i}"
                ${d.enabled ? 'checked' : ''}
              />
              <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2
                          peer-focus:ring-green-300 rounded-full peer dark:bg-gray-700
                          peer-checked:bg-green-500 peer-checked:after:translate-x-full
                          peer-checked:after:border-white after:content-[''] after:absolute
                          after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300
                          after:border after:rounded-full after:h-4 after:w-4 after:transition-all">
              </div>
            </label>
          </td>
          <td>
            <select class="border border-gray-300 rounded px-1 py-0.5 text-sm" id="layerSelect-${i}">
              ${layerOptions}
            </select>
          </td>
        </tr>
      `;
    }).join('');
    document.getElementById('selectedD').innerHTML = rows;
    dimensions.forEach((dim, idx) => {
      let checkbox = document.getElementById(`toggle-${idx}`);
      checkbox.onchange = () => {
        dim.enabled = checkbox.checked;
        checkAllToggles();
      };
      let layerSel = document.getElementById(`layerSelect-${idx}`);
      layerSel.onchange = () => {
        dim.layer = parseInt(layerSel.value, 10);
      };
    });
    checkAllToggles();
  };
  
  function checkAllToggles() {
    const allOff = dimensions.every(d => !d.enabled);
    const toggleMsg = document.getElementById('toggleMsg');
    if (allOff) {
      toggleMsg.style.minHeight = '1.5em';
      toggleMsg.textContent = 'You cannot influence text with control vectors if none are enabled.';
    } else {
      toggleMsg.style.minHeight = '1.5em';
      toggleMsg.textContent = '';
    }
  }
  
  let labelSelection = svg.selectAll('.label')
    .data(dimensions)
    .enter()
    .append('text')
    .attr('class', 'label text-sm')
    .attr('x', (d, i) => getCoordinate(i, 11.2).x)
    .attr('y', (d, i) => getCoordinate(i, 11.2).y)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#065f46')
    .text(d => d.name);
  
  const points = svg.selectAll('.point')
    .data(dimensions)
    .enter()
    .append('circle')
    .attr('class', 'point')
    .attr('r', 6)
    .attr('fill', '#065f46')
    .attr('cx', (d, i) => getCoordinate(i, d.value).x)
    .attr('cy', (d, i) => getCoordinate(i, d.value).y)
    .call(d3.drag()
      .on('drag', function(event, d) {
        const i = dimensions.indexOf(d);
        const angle = angleSlice * i - Math.PI / 2;
        const dx = event.x - centerX;
        const dy = event.y - centerY;
        const axisX = Math.cos(angle);
        const axisY = Math.sin(angle);
        let dist = dx * axisX + dy * axisY;
        dist = Math.max(0, Math.min(dist, scale(10)));
        let val = scale.invert(dist);
        val = Math.round(val * 2) / 2;
        d.value = val;
        const newX = centerX + scale(d.value) * axisX;
        const newY = centerY + scale(d.value) * axisY;
        d3.select(this).attr('cx', newX).attr('cy', newY);
        updateSelectedText();
        updateRadar();
      })
      .on('end', function(event, d) {
        onSpiderDragEnd(d);
      })
    );
  
  function onSpiderDragEnd(dimObj) {
    const dimName = dimObj.name;
    const dimValue = dimObj.value;
    const toggleMsg = document.getElementById('toggleMsg');
    if (!dimObj.enabled) {
      toggleMsg.textContent = `Dimension "${dimName}" is disabled. No text is modified.`;
      return;
    }
    if (dimensions.every(d => !d.enabled)) {
      return;
    }
    captureSelectedRange();
    const textArea = document.getElementById('resultArea');
    let storedText = textArea.innerText;
    let startOffset = localStartOffset;
    let endOffset = localEndOffset;
    if (startOffset === endOffset) {
      startOffset = 0;
      endOffset = storedText.length;
    }
    textArea.innerHTML = spinnerHTML(dimName, dimValue);
    fetch('/random_string', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimension: dimName, value: dimValue })
    })
    .then(res => res.json())
    .then(data => {
      let before = storedText.slice(0, startOffset);
      let after = storedText.slice(endOffset);
      textArea.innerText = before + data.randomString + after;
    })
    .catch(err => console.error(err));
  }
  
  function spinnerHTML(dimName, dimValue) {
    return `
      <div class="flex items-center space-x-2">
        <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg"
             fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <span class="text-gray-700">
          Updated <strong>${dimName}</strong> to <strong>${dimValue}</strong>. Waiting for model predictions...
        </span>
      </div>
    `;
  }
  
  let localStartOffset = 0;
  let localEndOffset = 0;
  function captureSelectedRange() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      localStartOffset = 0;
      localEndOffset = 0;
      return;
    }
    const container = document.getElementById('resultArea');
    const range = sel.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) {
      localStartOffset = 0;
      localEndOffset = 0;
      return;
    }
    localStartOffset = range.startOffset;
    localEndOffset = range.endOffset;
  }
  
  updateSelectedText();
  updateRadar();
  