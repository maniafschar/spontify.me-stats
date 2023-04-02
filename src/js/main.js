import ApexCharts from 'apexcharts';
import { communication } from './communication';
import { heatmap } from './heatmap';
import { ui } from './ui';

window.ApexCharts = ApexCharts;
window.ui = ui;
window.communication = communication;
window.heatmap = heatmap