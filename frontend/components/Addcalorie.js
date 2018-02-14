import React from 'react';
import {connect} from 'react-redux';
import {ScrollView, StyleSheet, View, AsyncStorage, TouchableNativeFeedback, AppState, FlatList, TextInput, TouchableOpacity} from 'react-native';
import {Picker, Text, Button, Form, Item, Label, Input, Icon, Fab} from 'native-base';
import {Grid, Col, Row} from 'react-native-easy-grid';
import foodData from './FoodCalorie.json';
import foodInfo from './foodCalorieArrays.json';

class Addcalorie extends React.Component{
    constructor(props){
        super(props);
        this.state={
            currentCalorie:0,
            selectedItem:'',
            selectedSubItem:'',
            foodItems:[],
            foodSubItems:[],
            items:'',
            subItems:'',
            displaySubItems:false,
            disableAddButton:true,

            foodNames:[],
            foodValues:[],
            foodNameEntered:'',
            data:[],
            chosenFoods:[],
            chosenCalories:[],
            totalCalorie:0
        };
    }

    componentWillMount(){
        for (i in foodData){
            this.setState({
                foodItems:this.state.foodItems.push(i)
            });
        }
        this.setState({
            items:this.state.foodItems.map((item) => {
                return(<Picker.Item style={{height:8}} label={item} value={item} key={item}/>);
            })
        },()=>{
            this.setState({
                foodNames:foodInfo.foodNames,
                foodValues:foodInfo.foodValues,
                currentCalorie:this.props.currentCalorie
            });
        });
    }

    addCalories=() => {
        this.setState({
            currentCalorie:this.state.currentCalorie+this.state.totalCalorie,
            totalCalorie:0
        },() => {
            this.props.update('updateCalorie',{currentCalorie:this.state.currentCalorie});
            storeCurrentCalorieOffline = async () => {
                try{
                    await AsyncStorage.setItem('SNAPDIET_CURRENTCALORIE',this.state.currentCalorie.toString());
                }
                catch(e){
                    console.log(e);
                }
                this.props.navigation.goBack();
            }
            storeCurrentCalorieOffline();   
        });
      }

      /*displaySubMenu=(value) => {
        this.setState({
            selectedItem:value,
            foodSubItems:[],
            displaySubItems:false
        },
        () => {
            for (i in foodData[value]){
                this.setState({
                    foodSubItems:this.state.foodSubItems.push(i)
                });
            }
            this.setState({
                subItems:this.state.foodSubItems.map((item) => {
                return(<Picker.Item style={{height:8}} label={item} value={item} key={item}/>);
                }),
                selectedSubItem:Object.keys(foodData[value])[0],
                displaySubItems:true,
                disableAddButton:false
            });    
        });
    }

    selectSubMenu=(value) => {
        this.setState({
            selectedSubItem:value
        });
    }*/

    updateList=(text) => {
        this.setState({
            foodNameEntered:text
        },() => {
            if(text!=""){
                let displayList=this.state.foodNames.filter((item) => {
                    return(item.toLowerCase().indexOf(text.toLowerCase())!=-1);
                });
                this.setState({
                    data:displayList
                });
            }
            else{
                this.setState({
                    data:[]
                })
            }
        });
    }

    choseItem=(item) => {
        let total=0;
        this.setState({
            data:[],
            foodNameEntered:'',
            chosenFoods:this.state.chosenFoods.concat([item]),
            chosenCalories:this.state.chosenCalories.concat([this.state.foodValues[this.state.foodNames.indexOf(item)]])
        },() => {
            for(i in this.state.chosenCalories){
                total+=parseInt(this.state.chosenCalories[i]);
            }
            if(total!=0){
                this.setState({
                    totalCalorie:total,
                    disableAddButton:false
                });
            }
        });
    }

    removeItem=(item) => {
        console.log(item);
        for(i in this.state.chosenFoods){
            if(this.state.chosenFoods[i]==item){
                //Remove food name
                let arr=this.state.chosenFoods;
                arr.splice(i,1);
                this.setState({
                    chosenFoods:arr
                },() => {
                    //Remove food calorie
                    let arr=this.state.chosenCalories;
                    arr.splice(i,1);
                    this.setState({
                        chosenCalories:arr
                    },() => {
                        //Recalculate total
                        let total=0;
                        for(i in this.state.chosenCalories){
                            total+=this.state.chosenCalories[i];
                        }
                        if(total==0){
                            this.setState({
                                totalCalorie:0,
                                disableAddButton:true
                            });
                        }
                        else{
                            this.setState({
                                totalCalorie:total
                            });
                        }
                    });
                });
            }
        }
    }

    addQty=(item) => {
        for(i in this.state.chosenFoods){
            if(this.state.chosenFoods[i]==item){
                //Calorie increment
                let arr=this.state.chosenCalories;
                arr[i]+=this.state.foodValues[this.state.foodNames.indexOf(item)];
                this.setState({
                    chosenCalories:arr
                },() => {
                    //Recalculate total
                    let total=0;
                    for(i in this.state.chosenCalories){
                        total+=this.state.chosenCalories[i];
                    }
                    if(total==0){
                        this.setState({
                            totalCalorie:0,
                            disableAddButton:true
                        });
                    }
                    else{
                        this.setState({
                            totalCalorie:total
                        });
                    }
                });
            }
        }
    }

    removeQty=(item) => {
        for(i in this.state.chosenFoods){
            if(this.state.chosenFoods[i]==item){
                //Calorie decrement
                let arr=this.state.chosenCalories;
                if(arr[i]-this.state.foodValues[this.state.foodNames.indexOf(item)]>0){
                    arr[i]-=this.state.foodValues[this.state.foodNames.indexOf(item)];
                    this.setState({
                        chosenCalories:arr
                    },() => {
                        //Recalculate total
                        let total=0;
                        for(i in this.state.chosenCalories){
                            total+=this.state.chosenCalories[i];
                        }
                        if(total==0){
                            this.setState({
                                totalCalorie:0,
                                disableAddButton:true
                            });
                        }
                        else{
                            this.setState({
                                totalCalorie:total
                            });
                        }
                    });
                }
            }
        }
    }

    render(){
        const chosenFoods=this.state.chosenFoods.map((food) => {
            return( <View>
                        <View style={styles.foodCard}>
                            <Text style={{color:'rgba(0,0,0,0.87)',fontFamily:'openSans'}}>{food}</Text>
                        </View>
                        <View style={{height:5}}/>
                    </View>
            );
        });

        const chosenCalories=this.state.chosenCalories.map((calorie) => {
            return( <View>
                        <View style={styles.foodCard}>
                            <Text style={{color:'rgba(0,0,0,0.87)', fontFamily:'openSans-bold'}}>{calorie}</Text>
                        </View>
                        <View style={{height:5}}/>
                    </View>
            );
        });

        const removeButtons=this.state.chosenFoods.map((food) => {
                return( 
                    <View>
                        <View style={[{flexDirection:'row', paddingRight:10, alignItems:'center'}, styles.foodCard]}>
                            <TouchableOpacity onPress={() => {this.addQty(food)}}>
                                <View style={[styles.buttons,{backgroundColor:'rgb(46,204,113)'}]}>
                                    <Icon style={{fontSize:14, color:'white'}} name='add'/>
                                </View>
                            </TouchableOpacity>

                            <View style={{width:5}}/>
                            <TouchableOpacity onPress={() => {this.removeQty(food)}}>
                                <View style={[styles.buttons,{backgroundColor:'rgb(52,152,219)'}]}>
                                <Icon style={{fontSize:14, color:'white'}} name='remove'/>
                                </View>
                            </TouchableOpacity>

                            <View style={{width:5}}/>
                            <TouchableOpacity onPress={() => {this.removeItem(food)}}>
                                <View style={[styles.buttons,{backgroundColor:'rgb(231,76,60)'}]}>
                                    <Icon style={{fontSize:14, color:'white'}} name='close'/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{height:5}}/>
                    </View>
            );
        });

        return(
            <View style={styles.container}>
                <Item>
                    <Input style={{color:'black'}} onChangeText={(text)=> {this.updateList(text)}} placeholder='Type food name...' value={this.state.foodNameEntered}/>
                </Item>
                    <FlatList 
                        style={styles.list}
                        data={this.state.data}
                        renderItem={(item) => {
                            return(
                                <View key={item.index}>
                                    <TouchableOpacity style={styles.listItem} onPress={() => {this.choseItem(item.item)}}>
                                            <Text style={{color:'black',fontFamily:'openSans'}}>{item.item}</Text>
                                    </TouchableOpacity>                                
                                    <View style={{borderBottomColor: 'rgba(0,0,0,0.2)',borderBottomWidth: 1}}/>
                                </View>
                            );
                        }}
                    />
                {/*<Form>
                    <Picker
                        mode="dialog"
                        selectedValue={this.state.selectedItem}
                        onValueChange={this.displaySubMenu}
                        style={{color:'black', width:250}}
                        >
                        {this.state.items}
                    </Picker>
                    {this.state.displaySubItems?
                        <Picker
                            mode="dialog"
                            selectedValue={this.state.selectedSubItem}
                            onValueChange={this.selectSubMenu}
                            style={{color:'black',width:250}}
                            >
                            {this.state.subItems}
                        </Picker>
                    :null}
                    </Form>*/}
                <View style={{height:20}}/>
                {(this.state.chosenFoods.length>0)?
                <Grid>
                    <Col size={40}>
                        <Row size={8}>
                            <Text style={{fontFamily:'openSans-bold'}}>Food</Text>
                        </Row>
                        <Row size={92} style={{flexDirection:'column'}}>
                            {chosenFoods}
                        </Row>
                    </Col>
                    <Col size={33}>
                        <Row size={8}>
                            <Text style={{fontFamily:'openSans-bold'}}>Calorie</Text>
                        </Row>
                        <Row size={92} style={{flexDirection:'column'}}>
                            {chosenCalories}
                        </Row>
                    </Col>
                    <Col size={27}>
                         <Row size={8}/>
                        <Row size={92} style={{flexDirection:'column'}}>
                            {removeButtons}
                        </Row>
                    </Col>
                </Grid>
                :null}

                <View>
                    <Button disabled={this.state.disableAddButton} onPress={() => {this.addCalories()}} style={{marginTop:'10%'}}><Text style={{color:'white'}}>Add</Text></Button>
                </View>
            </View>
        );
    }
}

const styles=StyleSheet.create({
    container:{
        height:'100%',
        backgroundColor:'rgba(255,255,255,0.87)', 
        padding:10,
        alignItems:'center'
    },
    snapchatYellow:{
        backgroundColor:'rgb(255,252,0)'
    },
    list:{
        position:'absolute',
        zIndex:101,
        top:60,
        left:10,
        width:'100%',
        backgroundColor:'rgb(240,240,240)',
        shadowColor:'black',
        elevation: 10,    
    },
    listItem:{
        width:'100%',
        height:40,
        justifyContent:'center',
        paddingLeft:10
    },
    buttons:{
        width:25,
        height:20,
        borderRadius:10,
        alignItems:'center',
        justifyContent:'center'
    },
    foodCard:{
        backgroundColor:'rgb(255,243,224)',
        height:40,
        shadowColor:'black',
        elevation:1,
        justifyContent:'center',
        paddingLeft:10
    }
  });
  
  export default connect(
      (store) => {
          return store;
      },
      (dispatch) => {
          return{
              update:(dispatchType,dispatchPayload) => {
                  dispatch({type:dispatchType,payload:dispatchPayload});
              }
          }
      }
  
  )(Addcalorie);