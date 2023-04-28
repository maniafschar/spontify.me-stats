import ApexCharts from 'apexcharts';
import { communication } from './communication';
import { heatmap } from './heatmap';
import { ui } from './ui';
import { charts } from './charts';

window.ApexCharts = ApexCharts;
window.ui = ui;
window.communication = communication;
window.heatmap = heatmap
window.charts = charts;