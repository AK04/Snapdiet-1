import React from 'react';
import {connect} from 'react-redux';
import {NetInfo, StyleSheet, View, AsyncStorage, TouchableNativeFeedback, AppState, Image, TouchableWithoutFeedback, ImageBackground} from 'react-native';
import {Picker, Text, Button, Form, Item, Label, Input, Icon, Fab} from 'native-base';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import { writeToDatabase, readFromDatabase } from '../firebase';
import * as Animatable from 'react-native-animatable';
import Tips from './Tips/Tips';

class Main extends React.Component {
    constructor(){
        super();
        this.state={
            currentCalorie:0
        };
    }
    
    componentDidMount(){

      getCurrentCalorieOffline = async () => {
        try{
          await AsyncStorage.getItem('SNAPDIET_CURRENTCALORIE',(error,data) => {
            if(error){
              console.log(error);
              this.props.update('updateCalorie',{currentCalorie:0});
            }
            else if(data==null){
              console.log("Data does not exist");
              this.props.update('updateCalorie',{currentCalorie:0});
            }
            else{
              this.props.update('updateCalorie',{currentCalorie:parseInt(data)});
            }
          });
        }
        catch(e){
          console.log(e);
        }
      }

      getDailyGoalOffline = async () => {
        try{
          await AsyncStorage.getItem('SNAPDIET_DAILYGOAL',(error,data) => {
            if(error){
              console.log(error);
              this.props.update('updateGoal',{dailyGoal:0});
            }
            else if(data==null){
              console.log("Data does not exist");
              this.props.update('updateGoal',{dailyGoal:0});
            }
            else{
              this.props.update('updateGoal',{dailyGoal:parseInt(data)});
            }
          });
        }
        catch(e){
          console.log(e);
        }
        getCurrentCalorieOffline();
      }

      getDailyGoalOffline();
    }


    fetchUserInfo = async (uid) => {
      let userInfo = await readFromDatabase(uid);
      console.log(userInfo);
      this.props.update('updateHistoryConsumed',{consumed:userInfo.actualCalories});
      this.props.update('updateHistoryGoals',{goals:userInfo.goalCalories});
      this.props.update('updateHistoryDates',{dates:userInfo.dates});
    }

    componentWillMount() {
      AppState.addEventListener('change',this.appStateChanged);

      //Load history
      AsyncStorage.getItem('SNAPDIET_HISTORY_CONSUMED',(error,data) => {
        if(data!=null && data!=''){
          this.props.update('updateHistoryConsumed',{consumed:JSON.parse(data)});
        }
        AsyncStorage.getItem('SNAPDIET_HISTORY_GOALS',(error,data) => {
          if(data!=null && data!=''){
            this.props.update('updateHistoryGoals',{goals:JSON.parse(data)});
          }
          AsyncStorage.getItem('SNAPDIET_HISTORY_DATES',(error,data) => {
            if(data!=null && data!=''){
              this.props.update('updateHistoryDates',{dates:JSON.parse(data)});
            }

            //Check for a new day
            getTimeOffline = async () => {
              await AsyncStorage.getItem('SNAPDIET_LASTSEENDATE',(error,data) => {
                d = new Date();
                if(
                  JSON.parse(data)[0]<d.getMinutes() ||
                  JSON.parse(data)[1]<d.getMonth() ||
                  JSON.parse(data)[2]<d.getFullYear()
                ){
                  //Add yesterday's data to history
                  storeHistory = async () => {
                    let dobj = new Date();
                    let dstring = dobj.getMinutes()+'/'+dobj.getMonth()+'/'+dobj.getFullYear();
                    if(this.props.dates[0]=='0'){
                      console.log("No history present");
                      AsyncStorage.setItem('SNAPDIET_HISTORY_CONSUMED',JSON.stringify([this.props.currentCalorie]));
                      AsyncStorage.setItem('SNAPDIET_HISTORY_GOALS',JSON.stringify([this.props.dailyGoal]));
                      AsyncStorage.setItem('SNAPDIET_HISTORY_DATES',JSON.stringify([dstring]));
                    }
                    else{
                      console.log("history already present");
                      AsyncStorage.setItem('SNAPDIET_HISTORY_CONSUMED',JSON.stringify(this.props.actualCalories.concat([this.props.currentCalorie])));
                      AsyncStorage.setItem('SNAPDIET_HISTORY_GOALS',JSON.stringify(this.props.goalCalories.concat([this.props.dailyGoal])));
                      AsyncStorage.setItem('SNAPDIET_HISTORY_DATES',JSON.stringify(this.props.dates.concat([dstring])));
                    }
                  }
                  storeHistory();
      
                  //Reset calorie counter
                  storeCurrentCalorieOffline = async () => {
                    await AsyncStorage.setItem('SNAPDIET_CURRENTCALORIE','0');
                    this.props.update('updateCalorie',{currentCalorie:0});
                  }
                  storeCurrentCalorieOffline(); 
                }
              });
            }
            getTimeOffline();

          });
        });
      });

      // NetInfo.getConnectionInfo().then((connectionInfo) => {
      //   if(connectionInfo.type=="wifi" || connectionInfo.type=="cellular"){
      //     let dataBody={
      //         "uid":this.props.uid,
      //         "dates":this.props.dates,
      //         "actualCalories":this.props.actualCalories,
      //         "goalCalories":this.props.goalCalories
      //     };
      //     writeToDatabase(dataBody);
      //   }
      // });

      // NetInfo.getConnectionInfo().then((connectionInfo) => {
      //   if(connectionInfo.type=="wifi" || connectionInfo.type=="cellular"){
      //     this.fetchUserInfo(this.props.uid);
      //   }
      // });

       
    
      getFirstLaunchOffline = async () => {
          await AsyncStorage.getItem('SNAPDIET_FIRSTLAUNCH',(error, data) => {
            if(error){
              console.log(error);
            }
            else if(data==null){
              this.props.navigation.navigate('FirstScreen');
            }
          });
        }
      getFirstLaunchOffline();
    }

    appStateChanged=(nextstate) => {

      if(nextstate=='background'){
        d = new Date();
        storeTimeOffline = async () => {
          await AsyncStorage.setItem('SNAPDIET_LASTSEENDATE',JSON.stringify([d.getMinutes(), d.getMonth(), d.getFullYear()]));
        }
        storeTimeOffline();
      }
    }
  
  render() {
    const bgimg=require('./background.jpg');

    const percent=this.props.dailyGoal?(parseInt((this.props.currentCalorie/this.props.dailyGoal)*100)):0;
//    this.props.update("updatePercent",{percent:percent});
    if(percent>=80 && percent<100){
      this.props.update('updateColor',{currentColor:'#FFCC00'});
    }
    else if(percent>=100){
      this.props.update('updateColor',{currentColor:'#FF3232'});
    }
    else{
      this.props.update('updateColor',{currentColor:'#78CC5B'});
    }
    
    return (
      <ImageBackground source={bgimg} style={{height:'auto', width:'auto', minHeight:'100%', minWidth:'100%'}}>
      <View> 
        
        <View style={styles.container}> 
          
          <Tips />
          <View style={{height:30}}/>
          
            <AnimatedCircularProgress
              size={225}
              width={13}
              fill={percent}
              tintColor={(percent<100)?'#b166ae':'rgb(255,0,0)'}
              onAnimationComplete={() => {  }}
              backgroundColor="rgba(125,160,175,0.6)"
              rotation={0}>
              {
                (fill) => (
                  <View style={{alignItems:'center'}}>
                    <Text style={styles.percent}>
                      {percent}%
                    </Text>
                    <Text style={styles.percentText}>Of your daily goal reached</Text>
                  </View>
                )
              }
            </AnimatedCircularProgress>

          <View style={{height:20}}/>

          <View style={{height:80}}/>

          <Fab style={styles.fabDesign} onPress={() => {this.props.navigation.navigate('Addcalorie')}} position='bottomRight'>
            <Animatable.View animation='flash' iterationCount={3}>
                <Icon style={{color:'black'}} name='add'/>
            </Animatable.View>
          </Fab>

        </View>
      </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    height:'100%',
    backgroundColor:'rgba(255,255,255,0.7)', 
    padding:10, 
    justifyContent:'center',
    alignItems:'center'
  },
  percent:{
    color:'rgba(0,0,0,0.6)',
    fontSize:50
  },
  percentText:{
    fontSize:12,
    fontFamily:'openSans',
    color:'rgba(0,0,0,0.5)'
  },
  snapchatYellow:{
    backgroundColor:'white',
  },
  fabDesign: {
    backgroundColor:'#66b169',
    width: 60,   
    height: 60,
    borderRadius: 40,
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

)(Main);

/*
          <View style={{flexDirection:'row', justifyContent:'center',alignItems:'center'}}>

            <Button onPress={() => {this.props.navigation.navigate('Calorie')}} bordered danger>
              <Text style={{color:'black'}}>Calorie</Text><Icon style={{color:'black'}} name='create'/> 
            </Button>

            <View style={{width:25}}/>
            
            <Button style={{alignSelf:'center'}} onPress={() => this.props.navigation.navigate('History')} bordered danger>
              <Icon style={{color:'black'}} name='trending-up'/>
            </Button>

          </View>
*/
