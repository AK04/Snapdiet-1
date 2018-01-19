import React from 'react';
import {connect} from 'react-redux';
import {StyleSheet, View, AsyncStorage} from 'react-native';
import {Text} from 'native-base';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

class Main extends React.Component {
    constructor(){
        super();
        this.state={
            showLogin:true
        };
        }
    
    componentDidMount(){
        getCurrentCalorieOffline = async () => {
          try{
            await AsyncStorage.getItem('SNAPDIET_CURRENTCALORIE',(error,data) => {
              this.props.update('updateCalorie',{currentCalorie:parseInt(data)})
            });
          }
          catch(e){
            console.log(e);
          }
        }

        getDailyGoalOffline = async () => {
          try{
            await AsyncStorage.getItem('SNAPDIET_DAILYGOAL',(error,data) => {
              this.props.update('updateGoal',{dailyGoal:parseInt(data)});
            });
          }
          catch(e){
            console.log(e);
          }
          getCurrentCalorieOffline();
        }

        getDailyGoalOffline();

        getNotifStateOffline = async () => {
          try{
            await AsyncStorage.getItem('SNAPDIET_NOTIFSTATE',(error,data) => {
              this.props.update('updateNotif',{showNotif:(data=='true')?true:false});
            });
          }
          catch(e){
            console.log(e);
          }
        }
        getNotifStateOffline();
    }

    handleSignup=() => {
        this.setState({
          showLogin:false
        });
    }

    setShowLogin=() => {
      this.setState({showLogin:true});
    }
  
  render() {
    const percent=this.props.dailyGoal?(parseInt((this.props.currentCalorie/this.props.dailyGoal)*100)):0;
   
    return (
      <View style={styles.container}>        
        <AnimatedCircularProgress
          size={225}
          width={13}
          fill={percent}
          tintColor={(percent<100)?'rgb(77,194,71)':'rgb(255,0,0)'}
          onAnimationComplete={() => {}}
          backgroundColor="rgba(125,160,175,0.6)"
          rotation={180}>
          {
            (fill) => (
              <Text style={styles.percent}>
                {percent}%
              </Text>
            )
          }
        </AnimatedCircularProgress>
        <View style={{height:20}}/>
        <Text style={{color:'rgba(0,0,0,0.6)'}}>Calories consumed today vs your goal</Text>
      </View>
    );
  }
}

const styles=StyleSheet.create({
  container:{
    height:'100%',
    backgroundColor:'rgba(255,255,255,0.87)', 
    padding:10, 
    justifyContent:'center',
    alignItems:'center'
  },
  percent:{
    color:'rgba(0,0,0,0.6)',
    fontSize:50
  },
  snapchatYellow:{
    color:'rgb(255,252,0)'
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