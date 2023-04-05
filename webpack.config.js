const path = require('path');

module.exports = (env) => {
	return {
		entry: './src/js/main.js',
		mode: 'production',
		output: {
			globalObject: 'this',
			filename: 'js/stats.js',
			path: path.resolve(__dirname, 'dist'),
		},
		optimization: {
			minimize: true
		},
		target: ['web', 'es5'],
		plugins: [
			{
				apply: compiler => {
					compiler.hooks.beforeCompile.tap('client', () => {
						var fs = require('fs');
						if (fs.existsSync('dist'))
							fs.rmSync('dist', { recursive: true });
						fs.mkdirSync('dist');
						fs.mkdirSync('dist/css');
						fs.mkdirSync('dist/js');
						fs.mkdirSync('dist/js/lang');
						fs.mkdirSync('dist/images');
						fs.cpSync('src/css/', 'dist/css', { recursive: true });
						fs.cpSync('src/js/lang/', 'dist/js/lang', { recursive: true });
						fs.cpSync('src/images/', 'dist/images', { recursive: true });
						fs.cpSync('src/stats.html', 'dist/stats.html');
						fs.cpSync('src/fanclub.html', 'dist/fanclub.html');
					})
				}
			}
		],
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: ['style-loader', 'css-loader']
				},
				{
					test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
					type: 'asset'
				}
			]
		}
	}
}