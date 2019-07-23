/**
 * @file sqlite数据库操作相关
 * @author 陈景
 */

/**
 * sqlite数据库模块
 * @module Sqlite
 * @example
 * var db = require("/path/to/sqlite").init({ dbFilePath: "/path/to/xxx.db" });
 */
export default function (Sqlite = {}) {
    const fse = require("fs-extra");
	const sqlite3 = require('sqlite3').verbose();
    const PATH = require('../path/path');
    // const Device = require('../device/device');

    /**
     * sqlite3数据库对象
     * @member db
     * @type {object}
     * @private
     */
    let db = null;

    // 用于判断初始化数据库是否完成
    Sqlite.initFinished = true;

    // 添加开发需要的测试数据
    function addBaseData(arg) {
        let sqls = [];

        // 默认区域
        sqls.push(`Insert Into t_area (name) values ('${arg.defaultArea}')`);

        // 中间表默认记录
        sqls.push(`
            Insert Into t_area_and_user values (1, 1)
        `);

        // 默认有一条管理员记录
        sqls.push(`
            Insert Into t_user (name, pwd)
            Values ('admin', '30f138b98bc1f7a96c2e049420e73e73')
        `);

        let sql;
        // 管理员权限数据
            sql = `update t_permission 
                set 
                    parent_id           = 1,
                    snapshot            = 1,
                    record              = 1,
                    remote_download     = 1,
                    patrol_setting      = 1,
                    ptz_setting         = 1,
                    resource_management = 1,
                    playback            = 1,
                    user_param          = 1,
                    live_view           = 1,
                    user_log            = 1,
                    electronic_map      = 1,
                    device_management   = 1,
                    remote_setting      = 1
                where
                    parent_id = 1;
            `;
        sqls.push(sql);

        Sqlite.permission_length = arg.permission_length;

            // 以下插入的是开发测试数据，发布时要删除
        // sqls.push(`
        //     Insert into t_device values (1,'8888888', '192.168.1.2', '我的设备', 80,'admin','123',1,2,'',1)
        // `);
        // sqls.push(`
        //     Insert into t_device values (1,'1232928', '192.168.1.1', 'My Device', 80,'admin','123',0,2,'',1)
        // `);
        // sqls.push(`insert into t_channel values (1,1,0,'ch_A',0,'',1)`);
        // sqls.push(`insert into t_channel values (1,2,0,'ch_B',0,'',1)`);
        // sqls.push(`insert into t_channel values (1,3,0,'ch_C',0,'',1)`);
        // sqls.push(`insert into t_channel values (1,4,0,'ch_D',0,'',1)`);
        // sqls.push(`insert into t_channel values (2,1,0,'ch_E',0,'',1)`);
        // sqls.push(`insert into t_group values (1, 'Group 1', '', 0)`);
        // sqls.push(`insert into t_group values (1, 'Group 2', '', 0)`);
        // sqls.push(`insert into t_group_and_channel values (1, 1)`);
        // sqls.push(`insert into t_group_and_channel values (1, 2)`);
        // sqls.push(`insert into t_group_and_channel values (1, 5)`);
        // sqls.push(`insert into t_group_and_channel values (2, 2)`);
        // sqls.push(`insert into t_group_and_channel values (2, 4)`);

        // 递归执行sql语句
        (function execSql(createSqls) {

            db.run(sqls[0], function(err) {
                if (err) {
                    console.error(err);
                } else {
                    sqls.shift();
                    if (sqls.length) {
                        execSql(sqls);
                    } else {
                        Sqlite.initFinished = true;
                    }
                }
            });

        }(sqls));
    }

    /**
     * 连接数据库，如果数据库不存在则创建并且创建表与触发器
     * @function init
     * @param {object} arg
     * @param {string} arg.dbFilePath 数据库文件路径
     * @param {string} arg.defaultArea 默认区域名称
     * @return {object} 返回sqlite数据库对象
     */
    Sqlite.init = function(arg) {

    	const isDbExists = fse.existsSync(arg.dbFilePath);

    	if (!isDbExists) {
            fse.ensureFileSync(arg.dbFilePath);
        }
        db = new sqlite3.Database(arg.dbFilePath);
    	if (!isDbExists) {
            Sqlite.initFinished = false;
            createAll({ defaultArea: arg.defaultArea });
        }
        return Sqlite;
    };

    /**
     * 获取第一条记录
     * @param  {string}   sql      sql查询语句
     * @param  {Function} callback 回调函数，有以下两个参数
     *
     * * err: 当查询发生错误，该参数为错误信息，如果没有发生错误，则该参数为null
     * * rows: 当查询成功时，该参数为查询结果，object类型，查询结果为空则该参数为undefined
     */
    Sqlite.selectFirstRow = function(sql, callback) {
        db.get(sql, callback);
    };

    /**
     * 在数据库匹配用户名与密码
     * @function login
     * @param {object} arg
     * @param {string} arg.name 用户名
     * @param {string} arg.pwd 用户密码
     * @param {Function} arg.fnError 回调函数，当查询发生错误时触发
     * @param {Function} arg.callback 回调函数，参数有以下两种情况：
     *
     * * 当查询的用户不存在，该函数的参数为 0
     * * 当查询的用户存在，但密码不正确，该函数的参数为 1
     * * 当查询的用户存在，密码也正确，该函数的参数为该用户的个人信息、用户参数及权限信息
     */
    Sqlite.login = function(arg) {

        let sql = `Select 1 From t_user where name='${arg.name}'`;
        db.get(sql, function(err, row) {
            if (err) {
                console.error(err);
                arg.fnError && arg.fnError();
                return;
            }
            if (arg.callback) {
                if (!row) {
                    arg.callback(0);
                } else {
                    sql =   `select a.rowid as user_id, * from
                                (select rowid, * from t_user where name='${arg.name}' And pwd='${arg.pwd}') a
                                join t_user_param b on a.rowid = b.parent_id
                                join t_permission c on a.rowid = c.parent_id`;

                    db.get(sql, (err, row) => {

                        if (err) {
                            console.error(err);
                            arg.fnError && arg.fnError();
                        } else {
                            arg.callback(row || 1);
                        }

                    });
                }
            }
        });
    };

    /**
     * 退出登录，修改自动登录以及退出登录时间
     * @author 朱洪德
     * @function loginOut
     * @param {object} arg
     * @param {number} arg.exit_time 退出登录的时间，时间戳数值
     * @param {Function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 修改失败参数为：{ success: 0 }
     * * 修改成功参数为：{ success: 1 }
     */
    Sqlite.loginOut = function(arg) {
        let sql =  `update
                        t_user
                    set
                        auto_login = 0,
                        last_exit_time = ${arg.exit_time}
                    where
                        rowid = ${User.info.user_id}`;

        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 修改密码
     * @author 朱洪德
     * @function changePwd
     * @param {object} arg
     * @param {string} arg.oldPwd 加密后的原密码
     * @param {string} arg.newPwd 加密后的新密码
     * @param {Function} arg.callback 该回调函数的参数有以下三种情况
     *
     * * 修改失败参数为：{ success: 0 }
     * * 原密码错误为：{ success: -1 }
     * * 修改成功参数为：{ success: 1 }
     */
    Sqlite.changePwd = function(arg) {

        if( gvFn.decode(arg.oldPwd) !== gvFn.decode(User.info.pwd) ){
            arg.callback({ success: -1 });
            return;
        }

        let sql =  `update
                        t_user
                    set
                        pwd = '${arg.newPwd}',
                        auto_login = 0,
                        remember_pwd = 0
                    where
                        rowid = ${User.info.user_id}`;

        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 启动app时，检测上次登录的用户是否记住密码和是否自动登录
     * @author 陈景
     * @function isRememberPwdAndAutoLogin
     * @param {object} arg
     * @param {Function} arg.callback 
     *
     * * 返回用户全部信息，object类型
     */
    Sqlite.isRememberPwdAndAutoLogin = function(arg) {
        let sql =  `select a.rowid as user_id, * from
                        (select rowid, * from t_user order by last_login_time desc limit 1) a
                        join t_user_param b on a.rowid = b.parent_id
                        join t_permission c on a.rowid = c.parent_id`;

        db.get(sql, (err, row) => {
            if (err) {
                console.error(err);
            } else {
                arg.callback && arg.callback(row);
            }
        });
    };

    /**
     * 查询数据库信息，在回调函数中返回所有查询结果
     * @author 陈景
     * @function selectAll
     * @param  {string}   sql      sql语句
     * @param  {Function} callback 回调函数，有以下两个参数
     *
     * * err: 当查询发生错误，该参数为错误信息，如果没有发生错误，则该参数为null
     * * rows: 当查询成功时，该参数为查询结果，数组类型，查询结果为空则该参数为空数组
     */
    Sqlite.selectAll = function(sql, callback) {
        db.all(sql, callback);
    };

    /**
     * 登录成功后，修改是否记住密码、是否自动登录以及登录时间
     * @author 陈景
     * @function updateLoginInfo
     * @param  {object} arg
     * @param {number} arg.rememberPwd 0: 未记住密码 1: 记住密码
     * @param {number} arg.auto_login 0: 不自动登录 1: 自动登录
     * @param {number} arg.user_id 用户id，对应表t_user的主键id
     * @param {function} arg.callback2 回调函数
     */
    Sqlite.updateLoginInfo = function(arg) {
        let sql = `update t_user
                   set    remember_pwd = ${arg.rememberPwd},
                          auto_login = ${arg.auto_login},
                          last_login_time = ${Number(new Date())}
                   where  rowid=${arg.user_id}`;
        db.run(sql, (err) => {
            if (err) {
                console.error(err);
            } else {
                arg.callback2 && arg.callback2();
            }
        });
    };

    /**
     * 获取用户权限范围内的所有设备信息
     * @author 陈景
     * @function getDeviceList
     * @param {object} arg
     * @param {number} arg.userId 用户id
     * @param {Function} arg.callback 回调函数，参数为查询返回的所有设备信息
    // 2017-5-4 朱洪德 修改非管理员用户获取设备信息的sql语句
     */
    Sqlite.getDeviceList = function(arg) {
        let sql = '';
        if(arg.userId == 1){
            sql =
             `
            select a.rowid as device_id, a.name as device_name,
                a.ssid as ssid, a.ssid_pwd as ssid_pwd,a.type as device_type,
                a.*, a.parent_id as device_parent_id,
                c.*, c.rowid as channel_id, c.type as channel_type, 
                d.*, d.rowid as preset_id
            from   t_device a
            join  (select area_id
                    from   t_area_and_user
                    where  user_id = ${arg.userId}) b on a.parent_id = b.area_id
            join  t_channel c on a.rowid = c.parent_id
            left join t_preset_pos d on c.rowid = d.preset_channel_id
            order by a.rowid, c.serial, d.rowid`;
        } else {
            sql = `
            select c.rowid as device_id, c.name as device_name, 
                   c.ssid as ssid, c.ssid_pwd as ssid_pwd,c.type as device_type,
                   c.parent_id as device_parent_id, c.*, 
                   b.rowid as channel_id, b.type as channel_type, b.*, d.name as area_name, 
                   e.*, e.rowid as preset_id
                from  (select * from t_user_and_channel where parent_id = ${arg.userId} and permission = 1) a
                join t_channel b on b.rowid = a.channel_id
                join t_device c on b.parent_id = c.rowid
                join t_area d on d.rowid = c.parent_id
                left join t_preset_pos e on b.rowid = e.preset_channel_id
                order by c.rowid, b.serial, e.rowid`;
        }


        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
            arg.callback && arg.callback(rows);
        });
    };

    /**
     * 通过名称获取设备
     * @author 朱洪德
     * @function getDeviceByName
     * @param {object} arg
     * @param {string} arg.device_name 设备名称
     * @param {string} arg.eseeid      设备id
     * @param {string} arg.ip          设备ip
     * @param {Function} arg.callback2 回调函数，参数为查询返回的设备信息，参数如下
     *  
     *  查询失败： { success: 0 }
     *  查询成功： { success: 1, row: 设备信息 }
     * 
     *  修改：本地登陆允许设备名称为空，因此加多传入的参数
     */
    Sqlite.getDeviceByName = function(arg) {
        let sql = `select a.rowid as device_id,a.parent_id as device_parent_id,a.name as device_name,a.type as device_type,
                          b.rowid as channel_id,b.name as channel_name, b.type as channel_type,* 
                   from (select rowid,* from t_device where name = '${arg.device_name}' and eseeid = '${arg.eseeid}' and ip = '${arg.ip}') a
                   join t_channel b on b.parent_id = a.rowid`;

        db.all(sql, (err, row) => {
            if (err){
                console.error(err);
                arg.callback2 && arg.callback2({ success: 0 });
                return;
            } else {
                arg.callback2 && arg.callback2({ success: 1, row: row });
            }
        });
    };

    /**
     * 删除指定设备
     * @author 朱洪德
     * @function deleteDevice
     * @param {object} arg
     * @param {number} arg.rowid 设备的rowid
     * @param {Function} callback 回调函数,有以下参数
     *
     * * {object}: object.success: 0为删除失败，1为删除成功
     */
    Sqlite.deleteDevice = function(arg,callback) {
        let sql = `Delete From t_device Where rowid = ${arg.rowid}`;

        db.run(sql, (err, rows) => {
            if (err) {
                console.log(err);
                callback && callback({ success: 0 });
                return;
            }
            callback && callback({ success: 1 });
        });
    };

    /**
     * 保存用户参数，写入数据库
     * @author 陈景
     * @function updateUserParam
     * @param {object} arg
     * @param {number} arg.user_id 用户表t_user的主键rowid
     * @param {object} arg.json 需要修改的用户参数项
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 执行失败参数为：{ success: 0 }
     * * 执行成功参数为：{ success: 1 }
     */
    Sqlite.updateUserParam = function(arg) {
        let sql = `update t_user_param set rowid = rowid`;
        for (let key in arg.json) {
            sql += ', ' + key + ' = "' + arg.json[key] + '"';
        }
        sql += ' where parent_id = ' + arg.user_id;

        db.run(sql, function(err) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                for ( let key in arg.json ){
                    User.info[key] = arg.json[key];
                }
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 添加设备
     * @author 陈景
     * @function addDevice
     * @param {array}   items    需要添加的设备信息，包括以下例子中的所有字段
     * ```
     *     items = [{
     *         parent_id: 1,
     *         eseeid: '123',
     *         ip: '192.168.1.1',
     *         name: '设备1',
     *         port: 80,
     *         login_name: 'admin',
     *         pwd: '618c9274d02fe19e262f47d2f8616d6e',
     *         connect_mode: 0,
     *         channel_count: 9 //通道数
     *     }, {
     *         ...
     *     }]
     * ```
     * @param {Function} callback 该函数的参数有以下两种情况
     *
     * * 全部设备添加成功: { success: 1 }
     * * 有设备添加失败: { success: 0 }
     */
    Sqlite.addDevice = function(items, callback) {
        const sqls = [];
        let index = 0;
        items.forEach(function(item) {
            index++;
            sqls.push({ data: item, sql:`
                insert into t_device (parent_id, eseeid, ip, name, port,
                    login_name, pwd, connect_mode, type, ssid, ssid_pwd)
                values (${item.parent_id}, '${item.eseeid}', '${item.ip}',
                    '${item.name}', '${item.port}', '${item.login_name}',
                    '${item.pwd}', ${item.connect_mode}, '${item.type}',
                    '${item.ssid}', '${item.ssid_pwd}')
            `});
        });

        if (!sqls.length) {
            callback && callback({ success: 1 });
            return;
        }
        
        (function exec(sqls) {
            db.run(sqls[0].sql, function(err) {
                if (err) {
                    console.error(err);
                    callback && callback({ success: 0 });

                } else {
                    let chSqls = [];
                    let data = sqls[0].data;

                    for (let i = 1; i <= data.channel_count; i++) {
                        let is_panorama = 0;
                        let channel_type = 0;

                        if ( data.chs ) {
                            is_panorama = data.chs[i-1].is_panorama;
                            channel_type = data.chs[i-1].channel_type;
                        } else if ( data.type == 4 ) {
                            is_panorama = 1;
                            channel_type = 1;
                        }

                        chSqls.push(`
                            insert into t_channel (parent_id, serial, is_wall, name, is_panorama, type, is_cruise, panorama_type)
                            values (${this.lastID}, '${i}', 1, '${data.chs ? data.chs[i-1].name : "ch_"+i}', 
                                    ${is_panorama}, ${channel_type}, 0, 1)
                        `);
                    }

                    (function execCh(chSqls) {
                        db.run(chSqls[0], function(err) {
                            if (err) {
                                console.error(err);
                            } else {
                                if(User.info.user_id != 1){
                                    let sql = `insert into t_user_and_channel (parent_id, channel_id, permission)
                                            values (${User.info.user_id}, ${this.lastID}, 1)`;
                                    db.run(sql,function(err){
                                        if(err){
                                            console.error(err);
                                        } else {
                                            chSqls.shift();
                                            if (chSqls.length) {
                                                execCh(chSqls);
                                            } else {
                                                sqls.shift();
                                                sqls.length ? exec(sqls) : callback({ success: 1 });
                                            }
                                        }
                                    });
                                } else {
                                    chSqls.shift();
                                    if (chSqls.length) {
                                        execCh(chSqls);
                                    } else {
                                        sqls.shift();
                                        sqls.length ? exec(sqls) : callback({ success: 1 });
                                    }
                                }

                            }
                        });
                    }(chSqls));

                }
            });
        }(sqls));
    };

    /**
     * 清空区域、设备
     * @author 陈景
     * @method clearAreaAndDevice
     * @param {Object} arg
     * @param {function} arg.callback 该函数的参数有以下两种情况
     *
     * * 成功: { success: 1 }
     * * 失败: { success: 0 }
     */
    Sqlite.clearAreaAndDevice = function(arg) {
        let sql = ` delete from t_area where rowid != 1 `;
        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                sql = `delete from t_device`;
                db.run(sql, (error) => {
                    if (error) {
                        console.error(error);;
                        arg.callback && arg.callback({ success: 0 });
                    } else {
                        arg.callback && arg.callback({ success: 1 });
                    }
                });
            }
        });
    };

    /**
     * 修改设备信息
     * @author 陈景
     * @function updateDevice
     * @param  {object} arg
     * @param {object} arg.oldInfo 原有的设备信息，即Device.list中的一个子项
     * @param {object} arg.newInfo 需要修改的设备信息，数据结构与Device.list的子项相同，参考下例
     *
     * ```
     *   {
     *     name: 'new device name',
     *     login_name: 'new login name',
     *     ...
     *     chs: [{
     *       name: 'new channel name',
     *       is_panorama: 1
     *     }, {
     *       ...
     *     }]
     *   }
     * ```
     */
    Sqlite.updateDevice = function(arg) {

        let oldChs = arg.oldInfo.chs;
        let newChs = arg.newInfo.chs;

        let sql = `
            update t_device
            set    eseeid = '${arg.newInfo.eseeid}',
                   ip = '${arg.newInfo.ip}',
                   parent_id = '${arg.newInfo.parent_id}',
                   name = '${arg.newInfo.name}',
                   port = ${arg.newInfo.port},
                   login_name = '${arg.newInfo.login_name}',
                   pwd = '${arg.newInfo.pwd}',
                   connect_mode = ${arg.newInfo.connect_mode},
                   type = ${arg.newInfo.type},
                   ssid = '${arg.newInfo.ssid}',
                   ssid_pwd = '${arg.newInfo.ssid_pwd}'
            where  rowid = ${arg.newInfo.rowid}
        `;

        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });

            } else {
                let sqls = [];
                let modifyCount = oldChs.length;

                // 新通道数大于原有通道数，需要增加通道
                if (newChs.length > oldChs.length) {
                    for (let i = modifyCount; i < newChs.length; i++) {
                        sqls.push(`
                            insert into t_channel (parent_id, serial, name, is_panorama, type)
                            values (${arg.oldInfo.rowid}, ${i + 1}, '${newChs[i].name}', ${newChs[i].is_panorama}, ${newChs[i].channel_type})
                        `);
                    }
                }
                // 新通道小于原有通道数，需要减少通道
                else if (newChs.length < oldChs.length) {
                    modifyCount = newChs.length;
                    sqls.push(`
                        delete from t_channel
                        where  parent_id=${arg.oldInfo.rowid}
                               and serial > ${newChs.length}`
                    );
                }

                // 修改原有通道的名称与是否为全景
                for (let i = 0; i < modifyCount; i++) {
                    if (newChs[i].name !== oldChs[i].name ||
                        newChs[i].is_panorama !== oldChs[i].is_panorama ||
                        newChs[i].channel_type !== oldChs[i].channel_type ) {
                        sqls.push(`
                            update t_channel
                            set    name='${newChs[i].name}',
                                   is_panorama=${newChs[i].is_panorama},
                                   type=${newChs[i].channel_type}
                            where  rowid=${oldChs[i].rowid}`
                        );
                    }
                }

                if (!sqls.length) {
                    arg.callback && arg.callback({ success: 1 });
                    return;
                };

                // 运行指令修改通道信息
                (function exec(sqls) {
                    db.run(sqls[0], (err) => {
                        if (err) {
                            console.error(err);
                        } else {
                            sqls.shift();
                            if (sqls.length) {
                                exec(sqls);
                            } else {
                                arg.callback && arg.callback({ success: 1 });
                            }
                        }
                    });
                }(sqls));
            }
        });
    };

    /**
     * 为分组添加通道
     * @author 陈景
     * @function addChannelToGroup
     * @param {object} arg
     * @param {number} arg.group_id 分组的ID
     * @param {array} arg.chIDs 通道ID
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 新增分组失败参数为：{ success: 0 }
     * * 新增分组成功参数为：{ success: 1 }
     */
    Sqlite.addChannelToGroup = function(arg) {
        let sqls = arg.chIDs.map(function(id) {
            return `insert into t_group_and_channel values (${arg.group_id}, ${id})`;
        });

        (function exec() {
            db.run(sqls[0], function(err) {
                if (err) {
                    console.error(err);
                    arg.callback({ success: 0 });
                } else {
                    sqls.shift();
                    sqls.length ? exec(sqls) : arg.callback({ success: 1 });
                }
            });
        }(sqls));
    };

    /**
     * 添加分组
     * @author 陈景
     * @function addGroup
     * @param {object} arg
     * @param {number} arg.user_id 用户表的主键
     * @param {string} arg.name 分组名称
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 新增分组失败参数为：{ success: 0 }
     * * 新增分组成功参数为：{ success: 1 }
     */
    Sqlite.addGroup = function(arg) {
        let sql = `insert into t_group (parent_id, name) values (${arg.user_id}, '${arg.name}')`;
        db.run(sql, function(err) {
            if (err) console.error(err);
            arg.callback2 && arg.callback2({ success: err ? 0 : 1, group_id: this.lastID });
        });
    };

    /**
     * 获取分组
     * @author 朱洪德
     * @function getGroup
     * @param {object} arg
     * @param {number} arg.user_id 用户表的主键
     * @param {string} arg.name 分组名称
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 获取分组失败参数为：{ success: 0 }
     * * 获取分组成功参数为：分组的信息，数组类型
     */
    Sqlite.getGroup = function(arg) {
        let sql = `select rowid,* from t_group where parent_id = ${arg.user_id} And name = '${arg.name}'`;
        db.get(sql, function(err, rows) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback(rows);
            }
        });
    };

    /**
     * 从分组中删除掉通道
     * @author 陈景
     * @function deleteChannelFromGroup
     * @param  {object} arg
     * @param {number} arg.group_id 欲删除通道的分组ID
     * @param {array} arg.chIDs 欲删除的通道ID
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 删除失败参数为：{ success: 0 }
     * * 删除成功参数为：{ success: 1 }
     */
    Sqlite.deleteChannelFromGroup = function(arg) {

        if (!arg.chIDs.length) {
            arg.callback && arg.callback({ success: 0 });
            return;
        }
        let sql = `delete from t_group_and_channel
                   where  group_id = ${arg.group_id}
                            and channel_id in (`;
        arg.chIDs.forEach(function(id) {
            sql += id + ',';
        });

        sql = sql.substring(0, sql.length - 1) + ')';

        db.run(sql, function(err) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 获取分组列表
     * @author 陈景
     * @function getGroupList
     * @param  {object} arg
     * @param {number} arg.user_id 用户id，对应t_user的主键
     * @param {function} arg.callback2 该回调函数的参数有以下两种情况
     *
     * * 获取分组列表失败： { success: 0 }
     * * 获取分组列表成功： 分组的信息，数组类型
     */
    Sqlite.getGroupList = function(arg) {
        let sql =   `select a.parent_id as group_parent_id, a.rowid as group_id, a.name as group_name,
                            a.reserve1 as group_reserve1, a.reserve2 as group_reserve2,
                            c.rowid as channel_id, c.*
                     from   (select rowid, * from t_group where parent_id = ${arg.user_id}) a
                                left join t_group_and_channel b on a.rowid = b.group_id
                                left join t_channel c on b.channel_id = c.rowid
                     order  by a.rowid, b.rowid`;

        db.all(sql, function(err, rows) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback(rows);
            }
        });
    };

    /**
     * 修改分组名称
     * @author 陈景
     * @function updateGroupName
     * @param  {object} arg
     * @param {string} arg.name 新的分组名称
     * @param {number} arg.rowid 分组的id，对应t_group的主键
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 更改分组名称失败： { success: 0 }
     * * 更改分组名称成功： { success: 1 }
     */
    Sqlite.updateGroupName = function(arg) {
        let sql = `update t_group set name = '${arg.name}' where rowid = ${arg.rowid}`;
        db.run(sql, function(err) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 删除分组
     * @author 陈景
     * @function deleteGroup
     * @param  {object} arg
     * @param {number} arg.rowid 分组的id，对应t_group的主键
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 删除分组失败： { success: 0 }
     * * 删除分组成功： { success: 1 }
     */
    Sqlite.deleteGroup = function(arg) {
        let sql = `delete from t_group where rowid = ${arg.rowid}`;
        db.run(sql, function(err) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 添加区域
     * @author 陈景
     * @function addArea
     * @param {object} arg
     * @param {string} arg.name 区域名称
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 添加区域失败： { success: 0 }
     * * 添加区域成功： { success: 1 }
     */
    Sqlite.addArea = function(arg) {
        let sql = `insert into t_area (name) values ('${arg.name}')`;
        db.run(sql, function(err) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                sql = `insert into t_area_and_user values (1, ${this.lastID});`;
                db.run(sql, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        arg.callback && arg.callback({ success: 1 });
                    }
                });
            }
        });
    };

    /**
     * 获取区域
     * @author 朱洪德
     * @function getArea
     * @param {object} arg
     * @param {string} arg.name 区域名称
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 获取区域列表失败： { success: 0 }
     * * 获取区域列表成功： 区域的信息，数组类型
     */
    Sqlite.getArea = function(arg) {
        let sql = `select rowid,* from t_area where name='${arg.name}'`;
        db.get(sql, function(err, rows) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback(rows);
            }
        });
    };

    /**
     * 获取区列表
     * @author 陈景
     * @function getAreaList
     * @param  {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 获取区域列表失败： { success: 0 }
     * * 获取区域列表成功： 区域的信息，数组类型
     */
    Sqlite.getAreaList = function(arg) {
        let sql = '';
        if(User.info.user_id == 1){
            sql =  `select rowid,* from t_area`;
        } else {
            sql =  `select a.* from 
                    (select rowid,* from t_area) a,
                    (select rowid,parent_id from t_device) b,
                    (select rowid,parent_id from t_channel) c,
                    (select channel_id from t_user_and_channel where parent_id = ${arg.user_id} and permission = 1) d
                    where d.channel_id = c.rowid and c.parent_id = b.rowid and b.parent_id = a.rowid
                    order by a.rowid`;
        }

        db.all(sql, function(err, rows) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                db.get(`select rowid,* from t_area where rowid = 1`, function(err, row){
                    if(err){
                        console.error(err);
                        arg.callback && arg.callback({ success: 0 });
                    } else {
                        rows.unshift(row);
                        arg.callback && arg.callback(rows);
                    }
                });
            }
        });
    };

    /**
     * 修改区域名称
     * @author 陈景
     * @function updateAreaName
     * @param  {object} arg
     * @param {string} arg.name 新的区域名称
     * @param {number} arg.rowid 区域ID，对应t_area的主键
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 修改区域失败： { success: 0 }
     * * 修改区域成功： { success: 1 }
     */
    Sqlite.updateAreaName = function(arg) {
        let sql = `update t_area set name = '${arg.name}' where rowid = ${arg.rowid}`;
        db.run(sql, function(err) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 删除区域
     * @author 陈景
     * @function deleteArea
     * @param  {object} arg
     * @param {number} arg.rowid 区域ID，对应t_area的主键
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 删除区域失败： { success: 0 }
     * * 删除区域成功： { success: 1 }
     */
    Sqlite.deleteArea = function(arg) {
        let sql = `delete from t_area where rowid = ${arg.rowid}`;
        db.run(sql, function(err) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 获取区域地图数据
     * @author 朱洪德
     * @function getAreaMap
     * @param  {object} arg
     * @param {number} arg.rowid 区域ID，对应t_area的主键
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 获取区域地图数据失败： { success: 0 }
     * * 获取区域地图数据成功： 区域地图数据
     */
    Sqlite.getAreaMap = function(arg) {
        let sql = `select map from t_area where rowid = ${arg.rowid}`;
        db.get(sql, function(err,row) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback(row);
            }
        });
    };

    /**
     * 设置区域地图数据
     * @author 朱洪德
     * @function setAreaMap
     * @param  {object} arg
     * @param {number} arg.rowid 区域ID，对应t_area的主键
     * @param {string} arg.map 区域地图数据
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 设置区域地图数据失败： { success: 0 }
     * * 设置区域地图数据成功： { success: 0 }
     */
    Sqlite.setAreaMap = function(arg) {
        let sql = `update t_area set map = '${arg.map}' where rowid = ${arg.rowid}`;
        db.run(sql, function(err) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 设置通道的位置信息，对应区域地图上的位置
     * @author 朱洪德
     * @function setChannelPosi
     * @param  {object} arg
     * @param {object} arg.posi_data 通道的位置信息
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 设置通道位置数据失败： { success: 0 }
     * * 设置通道位置数据成功： { success: 0 }
     */
    Sqlite.setChannelPosi = function(arg) {
        let sqls = [];

        if(arg.posi_data == 0){
            arg.callback && arg.callback({ success: 1 });
            return;
        }

        arg.posi_data.forEach(function(item){
            let posi = `x:${item.x};y:${item.y}`;
            sqls.push(`
                update t_channel set posi = '${posi}' where rowid = ${item.channel_id}
            `);
        });

        (function exec() {
            db.run(sqls[0], function(err) {
                if (err) {
                    console.error(err);
                    arg.callback && arg.callback({ success: 0 });
                } else {
                    sqls.shift();
                    sqls.length ? exec(sqls) : arg.callback && arg.callback({ success: 1 });
                }
            });
        }(sqls));
    };

    /**
     * 删除通道的位置信息
     * @author 朱洪德
     * @function deleteChPosi
     * @param  {object} arg
     * @param {array} arg.channel_id 存储通道的rowid的数组
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * 删除位置失败： { success: 0 }
     * * 删除位置成功： { success: 0 }
     */
    Sqlite.deleteChPosi = function(arg) {
        let sqls = [];

        if(arg.channel_id.length == 0){
            arg.callback && arg.callback({ success: 1 });
            return;
        }

        for(let i=0;i < arg.channel_id.length; i++){
            sqls.push(`update t_channel set posi = '' where rowid = ${arg.channel_id[i]}`);
        }

        (function exec(){
            db.run(sqls[0], function(err){
                if(err){
                    console.error(err);
                    arg.callback && arg.callback({ success: 0 });
                } else {
                    sqls.shift();
                    if (sqls.length) {
                        exec();
                    } else {
                        arg.callback && arg.callback({ success: 1 });
                    }
                }
            });
        })();
    };

    // 仅供调试使用
    Sqlite.debug = function(sql, callback) {
        return db;
    };

    /**
     * 获取用户列表，不包含管理员
     * @author 陈景
     * @method getUserList
     * @param {object} arg
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0, result: err } 失败，result为错误信息
     * * { success: 1, result: rows } 成功，result为查询获取的信息
     */
    Sqlite.getUserList = function(arg) {
        let sql = ` Select rowid, * From t_user where rowid != 1 `;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0, err: err });
            } else {
                arg.callback && arg.callback({ success: 1, result: rows });
            }
        });
    };

    /**
     * 获取单个用户的信息
     * @author 朱洪德
     * @method getUser
     * @param {object} arg
     * @param {string} arg.name 用户名
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0, result: err } 失败，result为错误信息
     * * { success: 1, result: rows } 成功，result为查询获取的信息
     */
    Sqlite.getUser = function(arg) {
        let sql = ` Select rowid, * From t_user where name = '${arg.name}' `;
        db.get(sql, (err, rows) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0, err: err });
            } else {
                arg.callback && arg.callback({ success: 1, result: rows });
            }
        });
    };

    /**
     * 获取最后登录的用户
     * @author 朱洪德
     * @method getLastLoginUser
     * @param {object} arg
     * @param {string} arg.limit 获取的数量
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0, result: err } 失败，result为错误信息
     * * { success: 1, result: rows } 成功，result为查询获取的信息
     */
    Sqlite.getLastLoginUser = function(arg) {
        arg.limit = arg.limit || 3;
        let sql = `select rowid,* from t_user where last_login_time != 0 order by last_login_time desc limit ${arg.limit}`;
        db.all(sql, (err, rows) => {
            let res = [];
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0, err: err });
            } else {
                arg.callback && arg.callback({ success: 1, result: rows });
            }
        });
    };

    /**
     * 删除用户的最后登录时间
     * @author 朱洪德
     * @method deleteUserLastLoginInfo
     * @param {object} arg
     * @param {string} arg.user_id 用户id
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 删除失败
     * * { success: 1 } 删除成功
     */
    Sqlite.deleteUserLastLoginInfo = function(arg) {
        let sql = `update t_user set last_login_time = 0 where rowid = ${arg.user_id}`;
        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 添加用户
     * @author 朱洪德
     * @method addUser
     * @param {object} arg
     * @param {string} arg.name 用户名称
     * @param {string} arg.remark   备注名
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 添加失败
     * * { success: 1 } 添加成功
     */
    Sqlite.addUser = function(arg) {
        let sql = `insert into t_user (name, remark, pwd) values ('${arg.name}', '${arg.remark}', '${gvFn.encode("")}' )`;
        db.run(sql, function(err) {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {

                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 删除用户
     * @author 朱洪德
     * @method deleteUser
     * @param {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 删除失败
     * * { success: 1 } 删除成功
     */
    Sqlite.deleteUser = function(arg) {
        let sql = ` delete from t_user where rowid = ${arg.user_id} `;
        db.run(sql, (err, rows) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 重置用户密码
     * @author 朱洪德
     * @method resetPwd
     * @param {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 重置失败
     * * { success: 1 } 重置成功
     */
    Sqlite.resetPwd = function(arg) {
        let sql = ` update t_user set pwd = '${gvFn.encode("")}' where rowid = ${arg.user_id} `;
        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 修改用户备注名称
     * @author 朱洪德
     * @method updateUserRemark
     * @param {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {string} arg.remark 备注名称
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 修改失败
     * * { success: 1 } 修改成功
     */
    Sqlite.updateUserRemark = function(arg) {
        let sql = ` update t_user set remark = '${arg.remark}' where rowid = ${arg.user_id} `;
        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 获取用户的模块权限
     * @author 朱洪德
     * @method getUserModulePermission
     * @param {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 获取失败
     * * { success: 1 , rows: rows } 获取成功, rows: 获取到的权限数据
     *
     */
    Sqlite.getUserModulePermission = function(arg) {
        let sql = ` select * from t_permission where parent_id = ${arg.user_id} `;
        db.get(sql, (err, rows) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1, rows: rows });
            }
        });
    };

    /**
     * 获取用户的通道权限
     * @author 朱洪德
     * @method getUserChannelPermission
     * @param {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 获取失败
     * * { success: 1 , rows: rows } 获取成功, rows: 获取到的权限数据，只获取有权限的数据
     *
     */
    Sqlite.getUserChannelPermission = function(arg) {
        let sql = ` select * from t_user_and_channel where parent_id = ${arg.user_id} and permission = 1 `;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1, rows: rows });
            }
        });
    };

    /**
     * 修改用户的模块权限
     * @author 朱洪德
     * @method updateUserModulePermission
     * @param {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {object}  arg.permission 需要修改的权限信息，数据结构如下
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 修改失败
     * * { success: 1 } 修改成功
     *
     *  example
     *  {                   //对象的key需和数据库的字段名称保持一致
     *      snapshot: 1,    //截图权限
     *      record: 1,      //录像权限
     *      ......
     *      ...
     *  }
     */
    Sqlite.updateUserModulePermission = function(arg) {
        if(!Object.keys(arg.permission).length){
            arg.callback && arg.callback({ success: 1 });
            return;
        }

        let sql = `update t_permission set `;

        Object.keys(arg.permission).forEach( (key, index) => {
            sql += ` ${key} = ${arg.permission[key]},`;
        } );
        sql = sql.slice(0,-1);

        sql += ` where parent_id = ${arg.user_id}`;
        
        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

    /**
     * 修改用户的通道权限
     * @author 朱洪德
     * @method updateUserChPermission
     * @param {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {array} arg.ch_info 需要修改权限的通道的数组，数据结构如下
     * * example
     * *  [
     *           { 
     *               channel_id: 1,      //通道id，对应通道的rowid
     *               permission: 1       //通道权限，0：无权限，1：有权限
     *           },
     *           ........
     *           ...
     *    ]
     *   
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 修改失败
     * * { success: 1 } 修改成功
     *
     */
    Sqlite.updateUserChPermission = function(arg) {
        let user_id = arg.user_id;
        let ch_info = arg.ch_info;
        let sqls = [];

        if(typeof user_id != 'number'){
            user_id = Number(user_id);
        }
        if(!user_id){
            arg.callback ? arg.callback({ success: 1 }) : '';
            return;
        }
        if(!ch_info.length){
            arg.callback ? arg.callback({ success: 1 }) : '';
            return;
        }

        ch_info.forEach(function(item, index){
            sqls.push({
                sql: `
                update 
                    t_user_and_channel
                set 
                    permission = ${item.permission}
                where 
                    parent_id=${user_id} and channel_id=${item.channel_id}
                `,
                channel_id: item.channel_id,
                permission: item.permission
            });
        });

        (function execSqls(sqls) {

            db.run(sqls[0].sql, function(err) {
                if (err) {
                    console.error(err);
                    arg.callback ? arg.callback({ success: 0 }) : '';
                } else {

                    if(this.changes == 0){
                        let insertSql = `
                            insert into 
                                t_user_and_channel 
                                (parent_id, channel_id, permission) 
                            values 
                                (${user_id}, ${sqls[0].channel_id}, ${sqls[0].permission})
                        `;
                        db.run(insertSql, (err) => {
                            if(err){
                                console.error(err);
                                arg.callback ? arg.callback({ success: 0 }) : '';
                            }
                        });
                    }

                    sqls.shift();
                    if (sqls.length) {
                        execSqls(sqls);
                    } else {
                        arg.callback ? arg.callback({ success: 1 }) : '';
                    }
                }
            });

        }(sqls));

    };

    /**
     * 获取用户参数
     * @author 陈景
     * @function getUserParam
     * @param  {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {function} arg.callback2 该回调函数的参数有以下两种情况
     *
     * * 失败： { success: 0 }
     * * 成功： { success: 1, rows: rows }
     */
    Sqlite.getUserParam = function(arg) {
        let sql = `select rowid,* from t_user_param where parent_id = ${arg.user_id}`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err);
                arg.callback2 && arg.callback2({ success: 0 });
            } else {
                arg.callback2 && arg.callback2({ success: 1, rows: rows });
            }
        });
    };

     /**
     * 设置用户日志
     * @author 朱洪德
     * @method setUserLog
     * @param {object} arg
     * @param {number} arg.user_id 用户ID
     * @param {number} arg.type 日志类型
     * @param {number} arg.time 设置日志的时间，时间戳
     * @param {number} arg.area 设置日志的操作区域   ps:当写入的日志类型是登录日志时，area为0
     * @param {string} arg.description 设置日志的描述
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 } 失败
     * * { success: 1 } 成功
     */
    Sqlite.setUserLog = function(arg) {
        if(arg.type == 3){
            arg.area = 0;
        }

        let sql = ` insert into t_user_log 
                        ( parent_id , type , time , area , description )
                    values
                        ( ${arg.user_id} , ${arg.type} , ${arg.time} , ${arg.area} , '${arg.description}' )`;
        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };

     /**
     * 获取日志列表
     * @author 谢泽华
     * @method getLogList
     * @param {object} arg
     * @param {number} arg.start_time 日志开始时间
     * @param {number} arg.end_time   日志结束时间
     * @param {number} arg.type       日志类型
     * @param {number} arg.area       日志区域，对应t_area表的rowid      ps:当查询的日志类型是登录日志或查询全部区域时，area为0
     * @param {string} arg.key_words  日志描述
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0, result: err } 失败，result为错误信息
     * * { success: 1, result: rows } 成功，result为查询获取的信息
     */
    Sqlite.getLogList = function(arg) {
        let sql = '';

        if(arg.type == 3){

            sql = `Select a.parent_id as user_id, b.name as user_name, *
                    From ( Select * From t_user_log where time between ${arg.start_time} and ${arg.end_time} and ${arg.type} ${arg.type == 0 ? '<' : '='} type and description like '%${arg.key_words}%') a
                    join (select name,rowid from t_user) b on a.parent_id = b.rowid
                    order by a.time DESC`;

        } else if (arg.type == 1 || arg.type == 2 && arg.area == 0){

            arg.area = Area.list[Area.list.length-1].rowid + 1;
            sql = `Select a.parent_id as user_id, b.name as user_name, *
                    From ( Select * From t_user_log where time between ${arg.start_time} and ${arg.end_time} and ${arg.type} ${arg.type == 0 ? '<' : '='} type and ${arg.area} > area and description like '%${arg.key_words}%') a
                    join (select name,rowid from t_user) b on a.parent_id = b.rowid
                    order by a.time DESC`;

        } else {
            let isAllArea = false;
            if ( arg.area == 0 ) {
                arg.area = Area.list[Area.list.length-1].rowid + 1;
                isAllArea = true;
            }
            sql = `Select a.parent_id as user_id, b.name as user_name, *
                    From ( Select * From t_user_log where time between ${arg.start_time} and ${arg.end_time} and ${arg.type} ${arg.type == 0 ? '<' : '='} type and 
                    (area ${isAllArea ? '<'+arg.area : '='+arg.area}) and description like '%${arg.key_words}%') a
                    join (select name,rowid from t_user) b on a.parent_id = b.rowid
                    order by a.time DESC`;
        }

        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0, err: err });
            } else {
                arg.callback && arg.callback({ success: 1, rows: rows });
            }
        });
    };

    /**
     * 用户第一次登陆后，弹出设置向导，改变第一次登陆的标记，再以后无需登陆后再弹出设置向导
     * @author 陈景
     * @function setFirstTimeLogin
     * @param {number} [user_id=1] 用户ID
     * @param {number} [value=0]   是否为第一次登陆
     */
    Sqlite.setFirstTimeLogin = function(user_id, value) {
        let sql = `
            update t_user
            set    is_first_time_login = ${value || 0}
            where  rowid = ${user_id || 1}`;
        db.run(sql, function(err) {
            if (err) {
                console.error(err);
            }
        });
    };

    /**
     * 设置轮巡策略
     * @author 朱洪德
     * @function setPolicy
     * @param {string} arg.policy_id     轮巡策略id，对应t_policy的rowid，修改策略需要此数据，新增则不需要
     * @param {string} arg.name     轮巡策略名称
     * @param {number} arg.interval 轮巡时间间隔
     * @param {number} arg.screen   分屏数
     * @param {array}  arg.channel  每个屏幕对应的通道，数据结构如下
     * 
     * [
     *      {
     *          index: 1,       窗口的位置
     *          channel_id: 1,  通道id，对应t_channel表的rowid
     *      },
     * ]
     * 
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 }  设置失败
     * * { success: 1 }  设置成功
     */
    Sqlite.setPolicy = function(arg){
        let sql = '';
        if(arg.policy_id){
            sql = `update t_policy set name = '${arg.name}', interval = ${arg.interval}, screen = ${arg.screen} where rowid = ${arg.policy_id}`;
        } else {
            sql = `insert into t_policy (name,interval,screen) values ('${arg.name}',${arg.interval},${arg.screen})`;
        }

        db.run(sql, function(err){
            let self = this;
            if (err) {
                console.error(err);
                arg.callback({ success: 0 });
            } else {
                if(!arg.channel){
                    arg.callback({ success: 1 ,rowid: self.lastID });
                    return;
                }
                let channelInfo = arg.channel;
                let sqls = [];
                channelInfo.forEach(function(item,index){
                    sqls.push(`insert into t_policy_and_channel (parent_id,channel_id,screen_number) values (${self.lastID},${channelInfo.channel_id},${channelInfo.index})`);
                })

                (function execSql(){
                    db.run(sqls[0], function(err){
                        if(err){
                            console.error(err);
                            arg.callback({ success: 0 });
                        } else {
                            sqls.shift();
                            sqls.length != 0 ? execSql() : arg.callback({ success: 1 ,rowid: self.lastID });
                        }
                    });
                })();
            }
        });
    };

    /**
     * 删除轮巡策略
     * @author 朱洪德
     * @function deletePolicy
     * @param {string} arg.policy_id     轮巡策略id，对应t_policy的rowid
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0 }  删除失败
     * * { success: 1 }  删除成功
     */
     Sqlite.deletePolicy = function(arg){
        let sql = `delete from t_policy where rowid = ${arg.policy_id}`;

        db.run(sql, (err) => {
            if(err){
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
     };
     
    /**
     * 获取轮巡策略列表
     * @author 朱洪德
     * @function getPolicyList
     * @param {function} arg.callback 该回调函数的参数有以下两种情况
     *
     * * { success: 0, result: err }  失败，result为错误信息
     * * { success: 1, result: rows } 成功，result为查询获取的信息
     */
    Sqlite.getPolicyList = function(arg){
        let sql = `select rowid,* from t_policy`;

        db.all(sql, function(err, rows){
            if (err) {
                console.error(err);
                arg.callback({ success: 0, result: err });
            } else {
                arg.callback({ success: 1, result: rows });
            }
        });
    };

    /**
     * 设置通道预置位信息
     * @author 林伟滨
     * @method setPresetPos
     * @param {object} arg
     * @param {number} arg.serial 通道号
     * @param {string} arg.name  预置位名称
     * @param {number} arg.x1  预置位X1坐标
     * @param {number} arg.y1  预置位Y1坐标
     * @param {number} arg.z1  预置位Z1坐标
     * @param {number} arg.x2  预置位X2坐标
     * @param {number} arg.y2  预置位Y2坐标
     * @param {number} arg.z2  预置位Z2坐标
     * @param {number} arg.x3  预置位X3坐标
     * @param {number} arg.y3  预置位Y3坐标
     * @param {number} arg.z3  预置位Z3坐标
     * @param {function} arg.callback 回调函数
     * 
     * * { success: 0 } 失败
     * * { success: 1 } 成功
     */
    Sqlite.setPresetPos = function(arg) {
        
        let sql = `select a.rowid from t_channel a where parent_id = ${arg.deviceId} and serial = ${parseInt(arg.ch)}`;

        db.get(sql, function(err, row) {
            console.log(arguments);
            if (err) console.error(err);
            
            if(row) {
                let sql2 = `insert into t_preset_pos (
                    preset_channel_id, preset_name,preset_index, x1, y1, z1, x2, y2, z2, x3, y3, z3) values (
                    ${row.rowid}, '${arg.name}', ${arg.index}, ${arg.x1}, ${arg.y1}, ${arg.z1},  ${arg.x2}, ${arg.y2}, ${arg.z2}, ${arg.x3}, ${arg.y3}, ${arg.z3}
                )`;
                db.run(sql2, function(err,row) {
                    let self = this;
                    arg.callback && arg.callback({
                        success: err ? 0 : 1 ,
                        preset_rowid: self.lastID
                    });
                });
            }

        });
    };

    /**
     * 删除通道预置位信息
     * @author 林伟滨
     * @method delPresetPos
     * @param {object} arg 
     * @param {number} arg.preset_rowid
     * @param {function} callback 回调函数
     */
    Sqlite.delPresetPos = function(arg, callback) {
        let sql = `Delete From t_preset_pos Where rowid = ${arg.preset_rowid}`;
        db.run(sql, (err) => {
            if (err) console.error(err);
            callback && callback({ success: err ? 0 : 1 });
        });
    };

    /**
     * 修改通道属性状态
     * @author 林伟滨
     * @method modifyChannelStatus
     * @param {object}      arg
     * @param {number}      arg.rowid   通道rowid 
     * @param {string}      arg.key        键值对
     * @param {number}      arg.value      键值对
     * @param {function}    arg.callback
     * * { success: 0, result: err }  失败，result为错误信息
     * * { success: 1, result: rows } 成功，result为查询获取的信息
     */
    Sqlite.modifyChannelStatus = function(arg) {
        let sql = `update t_channel set ${arg.key} = ${arg.value} where rowid = ${arg.rowid}`;
        
        db.run(sql, (err) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0 });
            } else {
                arg.callback && arg.callback({ success: 1 });
            }
        });
    };
    
    /**
     * 获取已存在的所有设备的列表
     * @author 朱洪德
     * @method getExistingDeviceList
     * @param {object}      arg
     * @param {function}    arg.callback
     * * { success: 0, err: err }  失败，err为错误信息
     * * { success: 1, rows: rows } 成功，rows为查询获取的信息
     */
    Sqlite.getExistingDeviceList = function(arg) {
        if(!db) {      // 数据库不存在时
            arg.callback && arg.callback({ success: 1, rows: [] })
            return
        }
        let sql = `select *,rowid from t_device`;
        
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err);
                arg.callback && arg.callback({ success: 0, err: err });
            } else {
                arg.callback && arg.callback({ success: 1, rows: rows });
            }
        });
    };

    // 初始化数据库创建表结构等
    let createAll = function(arg) {

        const createSqls = [];

        /**
         * @member t_area
         * @type {table}
         * @private
         * @description 区域表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |name|NVarchar(50)|区域名称|
         * |parent_id|Integer|父级的rowid，目前区域表没有父级表，属于预留字段|
         * |map|NVarchar(50)|区域地图的名称|
         * |reserve2|Integer|预留字段2|
         */
        createSqls.push(`
            Create Table t_area (
                name NVarchar(50) Not Null,
                parent_id Integer Default 1,
                map NVarchar(50),
                reserve2 Integer Default 0
            )
        `);

        /**
         * @member t_area_and_user
         * @type {table}
         * @private
         * @description 区域表与用户表的中间表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |area_id|Integer|对应区域表t_area的rowid|
         * |user_id|Integer|对应用户表t_user的rowid|
         */
        createSqls.push(`
            Create Table t_area_and_user (
                user_id Integer,
                area_id Integer
            )
        `);

        /**
         * @member t_channel
         * @type {table}
         * @private
         * @description 通道表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |parent_id|Integer|父表id，对应设备表t_device的rowid|
         * |serial|Integer|通道序号，大于0的整数|
         * |is_wall|Int2|是否为壁挂，0：否，即倒挂 1：是，即壁挂|
         * |name|NVarchar(30)|通道的备注名称|
         * |is_panorama|Int2|是否为全景设备 0：否 1：是|
         * |posi|NVarchar(30)|通道在电子地图上的位置信息|
         * |type|Integer|通道类型 0：普通 1：p系列|
         * |is_cruise|Int2| 是否为巡航模式, 0:否  1:是|
         * |panorama_type|Integer|全景模式类型  0:非全景 1 全景 2 圆柱  3 展开 4 二分屏  5 四分屏 8 六分屏|
         */
        createSqls.push(`
            Create Table t_channel (
                parent_id     Integer Not Null,
                serial        Integer,
                is_wall       Int2 default 1,
                name          NVarchar(30),
                is_panorama   Int2 default 0,
                posi          NVarchar(30),
                type          Integer Default 0,
                is_cruise     Int2 default 0,
                panorama_type Integer Default 1
            )
        `);

        /**
         * @member t_device
         * @type {table}
         * @private
         * @description 设备表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |parent_id|Integer|父表id，对应区域表t_area的rowid|
         * |eseeid|Varchar(35)|设备的id，可用于连接设备|
         * |ip|Varchar(200)|分配给设备的局域网ip|
         * |name|NVarchar(50)|设备的备注名称|
         * |port|Integer|端口|
         * |login_name|NVarchar(20)|设备的登录名|
         * |pwd|Varchar(200)|设备登录密码，此处已加密|
         * |connect_mode|Int2|连接模式 0: 优先使用ip连接  1: 优先使用id连接|
         * |type|Integer|设备类型  0: IPC 1: DVR 2: NVR 3: Onvif 4: VR CAM|
         * |ssid|NVarchar(50)|ssid|
         * |ssid_pwd|NVarchar(200)|ssid密码|
         */
        createSqls.push(`
            Create Table t_device(
                parent_id      Integer Not Null,
                eseeid         Varchar(35),
                ip             Varchar(200),
                name           NVarchar(50),
                port           Integer,
                login_name     NVarchar(20),
                pwd            Varchar(200),
                connect_mode   Int2,
                type           Integer Default 0,
                ssid           NVarchar(50),
                ssid_pwd       NVarchar(200)
            )
        `);

        /**
         * @member t_group
         * @type {table}
         * @private
         * @description 分组表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |parent_id|Integer|父表id，对应用户表t_user的rowid|
         * |name|NVarchar(50)|分组名称|
         * |reserve1|NVarchar(50)|预留字段1|
         * |reserve2|Integer|预留字段2|
         */
        createSqls.push(`
            Create Table t_group (
                parent_id     Integer Not Null,
                name          NVarchar(50) not Null,
                reserve1      NVarchar(50),
                reserve2      Integer Default 0
            )
        `);

        /**
         * @member t_group_and_channel
         * @type {table}
         * @private
         * @description 分组表与通道表的中间表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |group_id|Integer|对应分组表t_group的rowid|
         * |channel_id|Integer|对应通道表t_channel的rowid|
         */
        createSqls.push(`
            Create Table t_group_and_channel (
                group_id        Integer Not Null,
                channel_id      Integer Not Null
            )
        `);

        /**
         * @member t_permission
         * @type {table}
         * @private
         * @description 用户权限表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |parent_id|Integer|父表id，对应用户表t_user的rowid|
         * |snapshot|Int2|截图权限|
         * |record|Int2|录像权限|
         * |remote_download|Int2|远程下载权限|
         * |patrol_setting|Int2|轮巡设置权限|
         * |ptz_setting|Int2|云台设置权限|
         * |resource_management|Int2|资源管理权限|
         * |playback|Int2|录像回放权限|
         * |user_param|Int2|用户参数权限|
         * |live_view|Int2|实时预览权限|
         * |user_log|Int2|用户日志权限|
         * |electronic_map|Int2|电子地图权限|
         * |device_management|Int2|设备管理权限|
         * |remote_setting|Int2|远程设置权限|
         */
        let permission_sql = `
            Create Table t_permission(
                parent_id             Integer Not Null,
                snapshot              Int2 default 1,
                record                Int2 default 1,
                remote_download       Int2 default 1,
                patrol_setting        Int2 default 0,
                ptz_setting           Int2 default 1,
                resource_management   Int2 default 0,
                playback              Int2 default 1,
                user_param            Int2 default 0,
                live_view             Int2 default 1,
                user_log              Int2 default 0,
                electronic_map        Int2 default 0,
                device_management     Int2 default 0,
                remote_setting        Int2 default 0
            )
        `;
        createSqls.push(permission_sql);

        // 权限表的各权限项默认为0，但管理员全部为1，需特殊处理
        let reg = new RegExp("default", "g");
        arg.permission_length = permission_sql.match(reg).length;

        /**
         * @member t_policy
         * @type {table}
         * @private
         * @description 轮巡策略表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |name|NVarchar(20)|策略名称|
         * |interval|Integer|轮切时间间隔，单位秒|
         * |screen|Integer|分屏数|
         */
        createSqls.push(`
            Create Table t_policy (
                name       NVarchar(20),
                interval   Integer,
                screen     Integer default 0
            )
        `);

        /**
         * @member t_policy_and_channel
         * @type {table}
         * @private
         * @description 轮巡策略和通道的中间表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |parent_id|Integer|轮巡策略的id，对应t_policy表的rowid|
         * |channel_id|Integer|通道id，对应t_channel表的rowid|
         * |screen_number|Integer|播放窗口的位置|
         */
        createSqls.push(`
            Create Table t_policy_and_channel (
                parent_id   Integer,
                channel_id  Integer,
                screen_number    Integet
            )
        `);

        /**
         * @member t_user
         * @type {table}
         * @private
         * @description 用户表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |name|NVarchar(50)|用户名，登录系统的帐号名|
         * |remark|NVarchar(50)|备注名称，方便管理员知道该用户是谁|
         * |pwd|Varchar(200)|用户密码，此处已加密|
         * |remember_pwd|Int2|是否记住密码状态，0：不记住 1：记住|
         * |last_login_time|Integer|最后一次登录系统的时间|
         * |last_exit_time|Integer|最后一次退出系统的时间|
         * |is_first_time_login|Int2|是否为第一次登陆 0: 否 1: 是|
         * |reserve1|NVarchar(50)|预留字段1|
         * |reserve2|NVarchar(50)|预留字段2|
         * |reserve3|Integer|预留字段3|
         */
        createSqls.push(`
            Create Table t_user (
                name NVarchar(50) Not Null,
                remark NVarchar(50) Default '',
                pwd Varchar(200),
                remember_pwd Int2 Default 0,
                auto_login Int2 Default 0,
                last_login_time Integer Default 0,
                last_exit_time Integer Default 0,
                is_first_time_login Int2 Default 1,
                reserve1 NVarchar(50),
                reserve2 NVarchar(50),
                reserve3 Integer Default 0
            )
        `);

        /**
         * @member t_user_param
         * @type {table}
         * @private
         * @description 用户参数表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |parent_id|Integer|父表id，对应用户表t_user的rowid|
         * |record_path|NVarchar(200)|本地录像路径|
         * |snapshot_path|NVarchar(200)|截图路径|
         * |video_download_path|NVarchar(200)|录像下载路径|
         * |timeline_scale|Integer|时间轴默认刻度值，默认120分钟|
         */

        createSqls.push(`
            Create Table t_user_param (
                parent_id Integer Not Null,
                record_path NVarchar(200) Default '${PATH.defaultSavePath}\\record',
                snapshot_path NVarchar(200) Default '${PATH.defaultSavePath}\\snapshot',
                video_download_path NVarchar(200) Default '${PATH.defaultSavePath}\\video_download',
                userlog_path NVarchar(200) Default '${PATH.defaultSavePath}\\userlog',
                timeline_scale Integer Default 120
            )
        `);

        /**
         * @member t_user_and_channel
         * @type {table}
         * @private
         * @description 用户通道权限表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |parent_id|Integer|父表id，对应用户表t_user的rowid|
         * |channel_id|Integer|通道id，对应通道表t_channel的rowid|
         * |permission|Integer|用户权限，0：无权限，1：有权限|
         */

        createSqls.push(`
            Create Table t_user_and_channel (
                parent_id Integer Not Null,
                channel_id Integer Not Null,
                permission Integer Default 0
            )
        `);

        /**
         * @member t_user_log
         * @type {table}
         * @private
         * @description 用户日志表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |parent_id|Integer|父表id，对应用户表t_user的rowid|
         * |type|Integer|日志类型,0:全部类型、1：报警日志、2：操作日志、3：登录日志|
         * |time|Integer|时间,写入日志的时间戳|
         * |area|Integer|对应区域表t_area的rowid|
         * |description|NVarchar(200)|日志的描述内容|
         */
        createSqls.push(`
            Create Table t_user_log (
                parent_id       Integer,
                type            Integer,
                time            Integer,
                area            Integer,
                description     NVarchar(200)
            )
        `);
        
        /**
         * @member t_preset_pos
         * @type {table}
         * @private
         * @description 预置位表
         *
         * |字段名|数据类型|字段意义|
         * |--|--|--|
         * |preset_channel_id|Integer|父表id，对应用户表t_channel的rowid|
         * |preset_name|NVarchar(50)|预置位的名称
         * |preset_index|INTEGER| 预置位索引
         * |x1|Integer|X1坐标   |y1|Integer|Y1坐标  |z1|Integer|Z1坐标
         * |x2|Integer|X2坐标   |y3|Integer|Y2坐标  |z2|Integer|Z2坐标
         * |x3|Integer|X3坐标   |y3|Integer|Y3坐标  |z3|Integer|Z3坐标
         */
        createSqls.push(`
            CREATE TABLE t_preset_pos (
                preset_channel_id     Integer Not Null,
                preset_name	  NVarchar(50) NOT NULL,
                preset_index  Integer,
                x1	          REAL,
                y1	          REAL,
                z1	          REAL,
                x2	          REAL,
                y2	          REAL,
                z2	          REAL,
                x3	          REAL,
                y3	          REAL,
                z3	          REAL
            )
        `);

        /**
         * 触发器，删除区域表`t_area`时，删除与其相关的其他表记录
         * @member tr_delete_area
         * @type {trigger}
         * @private
         */
        createSqls.push(`
            Create Trigger tr_delete_area
            Before Delete On t_area
            For Each Row
            Begin
                Delete From t_device Where parent_id = old.rowid;
                Delete From t_area_and_user Where area_id = old.rowid;
            End
        `);

        /**
         * 触发器，删除通道表`t_channel`时，删除与其相关的其他表记录
         * @member tr_delete_channel
         * @type {trigger}
         * @private
         */
        createSqls.push(`
            Create Trigger tr_delete_channel
            Before Delete On t_channel
            For Each Row
            Begin
                Delete From t_group_and_channel Where channel_id = old.rowid;
                Delete From t_user_and_channel Where channel_id = old.rowid;
                Delete From t_preset_pos Where preset_channel_id = old.rowid;
            End
        `);

        /**
         * 触发器，删除设备表`t_device`时，删除与其相关的其他表记录
         * @member tr_delete_device
         * @type {trigger}
         * @private
         */
        createSqls.push(`
            Create Trigger tr_delete_device
            Before Delete On t_device
            For Each Row
            Begin
                Delete From t_channel Where parent_id = old.rowid;
            End
        `);

        /**
         * 触发器，删除分组表`t_group`时，删除与其相关的其他表记录
         * @member tr_delete_group
         * @type {trigger}
         * @private
         */
        createSqls.push(`
            Create Trigger tr_delete_group
            Before Delete On t_group
            For Each Row
            Begin
                Delete From t_group_and_channel Where group_id = old.rowid;
            End
        `);

        /**
         * 触发器，删除用户表`t_user`时，删除与其相关的其他表记录
         * @member tr_delete_user
         * @type {trigger}
         * @private
         */
        createSqls.push(`
            Create Trigger tr_delete_user
            Before Delete On t_user
            For Each Row
            Begin
                Delete From t_permission Where parent_id = old.rowid;
                Delete From t_area_and_user Where user_id = old.rowid;
                Delete From t_user_param Where parent_id = old.rowid;
                Delete From t_group Where parent_id = old.rowid;
                Delete From t_user_and_channel Where parent_id = old.rowid;
            End
        `);

        /**
         * 触发器，添加用户表`t_user`时，添加与其相关的权限表记录
         * @member tr_insert_user
         * @type {trigger}
         * @private
         */
        createSqls.push(`
            Create Trigger tr_insert_user
            After insert On t_user
            For Each Row
            Begin
                insert into t_permission (parent_id) values (new.rowid);
                insert into t_user_param (parent_id) values (new.rowid);
            End
        `);

        // 递归执行sql语句，创建表与触发器
        (function create(createSqls) {

            db.run(createSqls[0], function(err) {
                if (err) {
                    console.error(err);
                } else {
                    createSqls.shift();
                    createSqls.length ? create(createSqls) : addBaseData(arg);
                }
            });

        }(createSqls));

    };
    return Sqlite;
};
