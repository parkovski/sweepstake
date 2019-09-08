 const app = new Vue({
     el: "#app",
     data:{
         username: 'Alex',
         bio: 'I am from Boston.',
         players:[0,1,2,0,0,0,2,1,1,0,2,2,2,2,2,2,0,1,1,2,0,0,0,1],   
         jackpot: "10,000",
         newNote: '',
         notes: ['9.1.2019: won $153.18', '9.10.19: won $189.21'],
         plans:'',
         move: '',
         active: 'active',
         focus: 'focus',
         revealed: 'revealed'
     },
     computed:{
         
         noteEmpty: function(){
             return this.plans=='';
         },
         
        dotClasses: function(){  
            let mapped=this.players.map(x=>this.colorCode)
            
            return mapped
        },
         
        colorCode: function(input){
            switch(input){
                case 1: return "red"
                default: return "grey"
            }
    
        },
         
         playersComputed: function(){
             const irandom = n => Math.floor(Math.random() * n);
              let a = Array(100);
              for (let i = 0; i < a.length; i++) a[i] = { name: 'Test ' + i, guess: irandom(3), fake: irandom(3) }
             console.log(a)
             return a
         },
         isSteal: function(){
             return this.plans=='steal'
         }
     },
     methods:{    
         showRules: function() {
          $("#home").hide();  
          $("#plans").hide(); 
          $("#actions").hide();
          $("#reveal").hide();    
          $("#rules").show();
              $("#about").hide();   
             return true;
         },
         
         showPlay: function() {
             $("#home").hide();  
          $("#plans").show(); 
          $("#actions").show();
          $("#reveal").show();    
          $("#rules").hide();
              $("#about").hide();   
             return true;
         },
        
         showAccount: function() {
             $("#home").hide();  
          $("#plans").hide(); 
          $("#actions").hide();
          $("#reveal").hide();    
          $("#rules").hide();
          $("#about").show();   
             return true;
         },
         
         showHome:function() {
             $("#home").show();  
          $("#plans").hide(); 
          $("#actions").hide();
          $("#reveal").hide();    
          $("#rules").hide();
          $("#about").hide();   
             return true;
         }
         
         
         
     }
 });
