/**
 * @file 统一管理文件或目录路径
 * @author 陈景
 */

export default (function () {

	const path = require('path');
	let gvIsWin32 = process.platform === 'win32';
	let mode = process.env.NODE_ENV;
	// 默认路径
	let Path = {
		db: path.join(__dirname, '../../../../data.db'),
		defaultSavePath: path.join(__dirname, '../../../../save_files'),
	};


	// 打包后为生产模式，生产模式下项目文件存储在resources/app文件夹内，并且webpack构建代码后__dirname路径会出错，所以需要将Path下的路径全部重新赋值
	if (mode === 'production') {
		if (gvIsWin32) {
			Path = {
				db: path.join(process.env.LOCALAPPDATA, `CMS/data.db`),
				defaultSavePath:path.join(process.env.LOCALAPPDATA, `CMS/save_files`),
				
			};
		}else{
			Path = {
				db: path.join(process.env.HOME, 'CMS/conf/data.db'),
				defaultSavePath: (process.env.HOME, 'CMS/save_files'),
			};
		}
	}
	return Path;
}());