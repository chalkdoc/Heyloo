import { Injectable } from '@angular/core';
import { Game } from './game.model';
import { Player } from './player.model';
import { Question } from './question.model';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireAuth } from 'angularfire2/auth';
import { QUESTIONS } from './sample-questions';
import { Observable } from 'rxjs/Observable';

// Added by STZ for Chalkdoc integration
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/toPromise';


@Injectable()
export class HostService {

  private gameBasePath: string = '/games';
  private playerBasePath: string = '/players';
  gamesRef;
  games: FirebaseListObservable<Game[]> = null;  //A list of Games from Firebase
  game: FirebaseObjectObservable<Game> = null; // the current game
  playersList: FirebaseListObservable<Player[]> = null; //Current list of players
  //player: FirebaseObjectObservable<Player> = null; // the player/student
  player: FirebaseListObservable<Player[]>; 
  playerObs: FirebaseObjectObservable<Player>;
  gameStateObs: FirebaseObjectObservable<any>;

  //subGames: Game[]; // our list of games

  constructor(private database: AngularFireDatabase, private http: Http) {
    
    // A list of games as an observable
    // Database reference to the main Games list
    //const gamesRef = database.list(this.gameBasePath);

  }

  // STZ: Added error handling, created new Error handling method
  // STZ: Removed return value
  //Creates a new game when passed a complete Game
  createGame(newGame: Game): void{
    this.games = this.database.list(this.gameBasePath);
    this.games.push(newGame)
      .catch(error => this.handErrorToConsole(error))
  }


  // Returns a list of games Observable
  getGames(){
    this.games = this.database.list(this.gameBasePath);
    return this.games;
  }

  // // Returns a game Observable from game code
  // getGame(roomCode: number) {
  //   return this.database.list(this.gameBasePath);
  // }

  // Returns a game ListObservable from game code
  getGameAndKey(roomCode: number) {
    return this.database.list(this.gameBasePath, {
      query: {
        orderByChild: 'id',
        equalTo: roomCode
      }
    })
  }

  getGameByKey(key: string){
    this.game = this.database.object(this.gameBasePath+'/'+ key);
    return this.game;
  }

  // Returns a game ListObservable from game code
  getPlayersList(roomCode: number) {
    //let test: number = 77754;
    this.playersList = this.database.list(this.playerBasePath, {
      query: {
        orderByChild: 'gameId',
        equalTo: roomCode
      }
    });
    return this.playersList;
  }

  // Add a player to a specific game
  // STZ: TODO this currently does not have any error handling
  // such as if the player name is already taken
  addPlayer(player: Player){
    this.database.list(this.playerBasePath).push(player);
  }

  // getGame(chosenGameId: string){
  //   return this.database.object('games/' + chosenGameId);
  // }

  // this returns a DB reference
  // getGameFromCode(roomcode: number){
  //   var thisGame;
  //   console.log("subgames is: " + this.subGames)
  //   for(let i=0; i<this.subGames.length; i++){
  //     if(this.subGames[i].id == roomcode){
  //       thisGame = this.getGame(this.subGames[i]['$key']);
  //     }
  //   }
  //   if (thisGame != undefined) {
  //     return thisGame;
  //   } else {
  //     alert('There\'s no game with that code. Please try again!');
  //   }
  // }

  // getCurrentGamePlayerList(id: string){
  //   return this.database.list('games/' + id + '/player_list')
  // }

  // Added by STZ
  randomId(){
    return Math.floor(Math.random()*90000) + 10000;
  }

  // from STZ - currently we get these questions from code, but we need to get them from Firebase instead
  getQuestions() {
    return QUESTIONS;
  }

  getFirebaseQuestions(id: string){
    return this.database.list('games/' + id + '/question_list')
  }


  // STZ: Currently hard coded to the assets folder
  // public getJSONQuestions(id: String): Observable<any> {
  //   return this.http.get("./assets/chalkdoc/"+ id + ".json")
  //                   .map((res:any) => res.json())
  //                   .catch((error:any) => {
  //                     console.log(error)
  //                     return error;
  //                   });
  // }

  getJSONQuestions(id: string): Promise<any> {
    let headers = new Headers({ 'Content-Type': 'application/json', 
    'Accept': 'q=0.8;application/json;q=0.9' });
    let options = new RequestOptions({ headers: headers });
    return this.http
        .get("./assets/chalkdoc/"+ id + ".json", options)
        .toPromise()
        .then(this.extractData)
        .catch(this.handleError);
  }

  private extractData(res: Response) {
      let body = res.json();
      return body || {};
  }

  //STZ: Why is this returning a promise?? 
  //Our error handler
  private handleError(error: any): Promise<any> {
      console.error('An error occurred', error);
      return Promise.reject(error.message || error);
  }  



  // editGameState(gameState, game){
  //   var currentGame = this.getGameFromCode(game.id);
  //   currentGame.update({game_state: gameState});
  // }

  editGameState(gameState){
    this.game.update({game_state: gameState});
  }

  // this creates a listener that fires when
  // current_question changes on the server
  // nextQuestion(game) {
  //   var nextQuestion;
  //   var currentGame = this.getGameFromCode(game.id); // returns a db ref to our game

  //   // is this subscribe code needed?
  //   currentGame.subscribe(data => {
  //     nextQuestion = data['current_question'];
  //   })
  //   // This should be inside the subsciption right?
  //   currentGame.update({current_question: nextQuestion + 1});
  // }

  nextQuestion(questionNumber: number) {
      this.game.update({current_question: questionNumber+1})

  }

  // gameOver(game){
  //   var currentGame = this.getGameFromCode(game.id);
  //   currentGame.update({game_over: true});
  // }

  gameOver(){
    this.game.update({game_over: true});
  }

  // updatePlayerList(players, game){
  //   var currentGame = this.getGameFromCode(game.id);
  //   currentGame.update({player_list: players});
  // }

  updatePlayerList(players){
    this.game.update({player_list: players});
  }

  // Delete a single player
  deletePlayer(player:any){
    this.database.list(this.playerBasePath).remove(player.$key)
    .catch(error => this.handleError(error))
    console.log(`Player ${player.name} deleted from the game` );
  }

   // Deletes a single item
  // deleteItem(key: string): void {
  //   this.items.remove(key)
  //     .catch(error => this.handleError(error))
  // }

  // updatePlayerChoice(questions, game){
  //   var currentGame = this.getGameFromCode(game.id);
  //   currentGame.update({question_list: questions});
  // }

  updatePlayerChoice(questions){
    this.game.update({question_list: questions});
  }

  //Added by STZ
  // per this: https://stackoverflow.com/questions/40795605/create-or-increment-a-value-with-angular2-angularfire2
  submitPlayersAnswer(gameKey: string, questionNumber: number, answer: number){
    let nodePath = `/games/${gameKey}/question_list/${questionNumber}/player_choices/${answer}`;
    let ansObs = this.database.object(nodePath);
    ansObs.$ref.transaction(count => {
      return count ? count + 1 : 1;
    });
    // this.game.update({question_list:})
  }

  // Default error handling for all actions
  private handErrorToConsole(error) {
    console.log(error)
  }

  // Returns a player FirebaseListObservable from game code and player id
  getPlayerFromId(playerId: number): FirebaseListObservable<Player[]> {
    this.player = this.database.list(this.playerBasePath, {
      query: {
        orderByChild: 'id',
        equalTo: playerId,
        limitToFirst: 1
      }
    })
    return this.player;
  }

  editPlayerPoints(passedPlayer, correct, score){
    this.playerObs = this.database.object(this.playerBasePath+'/'+passedPlayer.key);

    //var totalPoints;
    //var totalCorrect;
    //var totalWrong;
    // // student.subscribe(data => {
    //   totalPoints = data.points;
    //   totalCorrect = data.correct;
    //   totalWrong = data.wrong;
    // })
    console.log(this.playerObs.$ref);
    if(correct == true){
      
      this.playerObs.update({points: (passedPlayer.points + score), correct: (passedPlayer.correct + 1), questionPoints: score, answered: true});
    }
    else if(correct == false){
      this.playerObs.update({wrong: (passedPlayer.wrong + 1), questionPoints: 0, answered: true});
    }
  }

  resetPlayerForNextQuestion(player){
    this.database.object(this.playerBasePath + '/' + player.key).update({answered: false, questionPoints: 0})
  }

  editSkipPoints(student,totalPoints,score){
    student.update({points: (totalPoints - score), answered: false});
    student.subscribe(data => {
    })
  }

  getGameState(gameKey: string){
    this.gameStateObs = this.database.object(this.gameBasePath+'/'+gameKey);
    return this.gameStateObs;
  }

}
