const WorkerBase = require('yeedriver-base/WorkerBase');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

class Gowld extends WorkerBase{

    initDriver(options){
        this.options = options;

        this.devices = _.mapValues(options.sids,(item)=>{
            return {
                WI1:0,
                WI2:0,
                WI3:0,
                WI4:{},
                WI5:{},
            }
        })

        if(!this.server){
            this.server = express();
            this.server.use(bodyParser.urlencoded({extended: false}));
            this.server.use(bodyParser.json({strict:false}));
            this.server.all('/:type',function (req, res) {

                let mchtNo = req.params.mchtNo;

                if(mchtNo){
                    if(!this.options.sids[mchtNo]){
                        let devices = {};
                        devices[mchtNo] = {
                            uniqueId:'pi',
                            groupId:".",
                        }
                        this.inOrEx({type: "in", devices: devices})
                    }

                    switch (req.params.type){

                        case "car":
                            this.devices[mchtNo]['WI1'] = parseInt(req.body.total) || 0;
                            this.devices[mchtNo]['WI2'] = parseInt(req.body.free) || 0;
                            this.devices[mchtNo]['WI3'] = parseInt(req.body.used) || 0;
                            break;
                        case "in":
                            this.devices[mchtNo]['WI4'] = req.body;
                            break;
                        case "out":
                            this.devices[mchtNo]['WI5'] = req.body;
                            break;
                        default:
                            break;
                    }
                    this.emit('RegRead',{devId:mchtNo ,memories:this.autoReadMaps[mchtNo]});
                }

                console.log(`type:${req.params.type}   : `,req.body)
                res.json({respCode:"000000",resMsg:""})
            })

            this.server.listen(options.port||8124)

        }

    }

    ReadWI(mapItem,devId){
        const retObj = [];
        for (let i = mapItem.start; i <= mapItem.end; i++) {
            retObj.push(this.devices[devId]?this.devices[devId]["WI"+i.toString()]:undefined);
        }
        return P.resolve(retObj);
    }

}