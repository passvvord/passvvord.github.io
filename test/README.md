> content
> 1. [test_01](#test_01)
> 2. [test_02](#test_02)
> 3. [test_03](#test_03)
> 4. [test_04](#test_04)
> 5. [test_05](#test_05)
> 6. [test_06](#test_06)
> 7. [test_07](#test_07)
> 8. [test_08](#test_08)
> 9. [test_09](#test_09)
> 10. [test_10](#test_10)
> 11. [test_11](#test_11)
> 12. [test_12](#test_12)
> 13. [test_13](#test_13)
> 14. [test_14](#test_14)
> 15. [test_15](#test_15)
> 16. [test_16](#test_16)
> 17. [test_17](#test_17)
> 18. [test_18](#test_18)
> 19. [test_19](#test_19)
> 20. [test_20](#test_20)
> 21. [test_21](#test_21)
> 22. [test_22](#test_22)
> 23. [test_23](#test_23)
> 24. [test_24](#test_24)
> 25. [test_25](#test_25)

# test_01
https://passvvord.github.io/test/test_01/test_01.html<br>
just 400 horisontal centerd by height lines with self height and color random changes 

# test_02
https://passvvord.github.io/test/test_02/test_02.html<br>
cursor changed with css and small box following cursor<br>
idea was to make box become border for some elements when cursor hover them 

# test_03
https://passvvord.github.io/test/test_03/test_03.html<br>
some cool css animation based on 
```css
filter: blur(...) contrast(...)
```
need to be updated cuz css now support cos() and sin() and code will be better with those

# test_04
https://passvvord.github.io/test/test_04/test_04.html<br>
some cool css animation based on css in [test_03](#test_03) but applyed to canvas which render some dots moving (modifyed some code i saw online)

# test_05
https://passvvord.github.io/test/test_05/preloader.html<br>
looooong preloader but animation steps must be fixed

# test_06
https://passvvord.github.io/test/test_06/test_06.html<br>
firebase realtime database test (api key on page but database dont contain any information which really matters)<br>
if you move mouse on page or move finger (for touchscreen) then position will be send to DB and all people who opened site will see those changes<br>
need some fixes to smoother work on touchscreens

# test_07
no url<br>
i deleted it, dont remember why

# test_08
https://passvvord.github.io/test/test_08/sprite_test.html<br>
compare gif and sprite (rendered as background for custom html element [```<run-sprite></run-sprite>```](https://passvvord.github.io/test/test_08/run-sprite.js) with background-position which refers to global css variable) 

# test_09
https://passvvord.github.io/test/test_09/walking_test.html<br>
samll area covered with sprites using custom html element created in [test_08](#test_08) and add charecter with some movment by arrorw keys (not wasd)

# test_10
https://passvvord.github.io/test/test_10/index.html<br>
small game where you need to understand what to do

# test_11
https://passvvord.github.io/test/test_11/index.html<br>
uhh why this test is empty

# test_12
https://passvvord.github.io/test/test_12/index.html<br>
Dicom 3D viewer with spesific border detection (better to be rewrited with WebGl and Shaders on THREE.js but it works in curent state)<br>
support PC and mobile (don`t suport ios (or only Safari) and maybe other apple devices)<br>
auto load data and add animation or not:
- [```url + ?0```](https://passvvord.github.io/test/test_12/index.html?0) auto load data 0
- [```url + ?0a```](https://passvvord.github.io/test/test_12/index.html?0a) auto load data 0 + animation
- [```url + ?1```](https://passvvord.github.io/test/test_12/index.html?1) auto load data 1
- [```url + ?1a```](https://passvvord.github.io/test/test_12/index.html?1a) auto load data 1 + animation

# test_13
https://passvvord.github.io/test/test_13/utf%20test.html<br>
simple page to display utf symbols in range given in URL:<br>
## url search part structure:
- ```url + ?{part 1}{part 2}{part 3}``` example: [```?x2000-3000L8S32```](https://passvvord.github.io/test/test_13/utf%20test.html?x2000-3000L8S32)
- parts can be in any order like: ```url + ?{part 1}{part 2}{part 3}```
- if part has defaut value it can be removed and will be replaced with default ```url + ?{part 1}```
### part 1:
defines range of utf codePoints which must be displayed<br>
```{part 1} = {part 1.1}{sub part 1.2}{sub part 1.3}{sub part 1.4}``` example: ```?x2000-3000```<br>
***this part has no default value and must be defined***
1. ```{part 1.1}``` can be:
   - ```b``` - binary
   - ```d``` - decimal
   - ```x``` - hexidecimal
   - ```a``` - base36 (to base36: ```({number}).toString(36)``` from base36: ```parseInt({base36string},36)```)
2. ```{part 1.2}``` is a number in base defined in ```{part 1.1}``` ***only uint, (has limits)***
3. ```{part 1.3}``` can be:
   - ```-``` means that it will display symbols from ```{part 1.2}``` to ```{part 1.4}```
   - ```+-``` means that it will display symbols from ```{part 1.2} - {part 1.4}``` to ```{part 1.2} + {part 1.4}```
4. ```{part 1.4}``` is a number in base defined in ```{part 1.1}``` ***only uint, (has limits)***

### part 2:
defines count of lines of symbols per one table<br>
```{part 2} = {part 2.1}{sub part 2.2}``` example ```L16```<br>
***default value: 4***
1. ```{part 2.1}``` letter ```L```
2. ```{part 2.2}``` number of lines of symbols per one table ***only decimal uint in bounds: [1; 999]*** (you also can enter 0 here but it will be replaced with 1)

### part 3:
defines count of symbols per one line of table<br>
```{part 3} = {part 3.1}{sub part 3.2}``` example ```S16```<br>
***default value: 64***
1. ```{part 3.1}``` letter ```S```
2. ```{part 3.2}``` number of symbols per one line of table ***only decimal uint in bounds: [1; 999]*** (you also can enter 0 here but it will be replaced with 1)

# test_14
https://passvvord.github.io/<br>
...

# test_15
no url<br>
here is some dicom data which can be loaded using fetch

| №|name                  |modality|part          |orientation|images count|
|--|---                   |---     |---           |---        |---         |
| 1|V-01-CT-BRAIN         |CT      |BRAIN         |SAG        |174         |
| 2|V-02-MR-BRAIN         |MR      |BRAIN         |COR        |200         |
| 3|V-03-CT-CHESTABDPELVIS|CT      |CHESTABDPELVIS|TRA        |101         |
| 4|V-04-MR-BRAIN         |MR      |BRAIN         |SAG        |180         |
| 5|V-05-CT-CHEST         |CT      |CHEST         |TRA        |115         |
| 6|V-06-MR-LEG           |MR      |LEG           |TRA        |46          |
| 7|V-07-CT-KIDNEY        |CT      |KIDNEY        |COR        |78          |
| 8|V-08-MR-BRAIN         |MR      |BRAIN         |TRA        |140         |
| 9|V-09-CT-LIVER         |CT      |LIVER         |TRA        |154         |
|10|V-10-CT-HEADNECK      |CT      |HEADNECK      |COR        |172         |

**how to load data**:
```js
const baseLink = 'https://passvvord.github.io/test/test_15'
// data 0 (4D data 40 3D frames with time position each frame is 256*256*17 voxels )
Promise.all( new Array(680).fill().map((a,i)=>fetch(`${baseLink}/PWI_680_slices_256x256/Stroke MR${(i+389).toString().padStart(5,'0')}.dcm`)) ).then(F=>{...})

// data 1
Promise.all( new Array(174).fill().map((_,i)=>fetch(`${baseLink}/V-01-CT-BRAIN/${i.toString().padStart(6,'0')}.dcm`)) ).then(F=>{...})
```

# test_16
https://passvvord.github.io/test/test_16/clock%20test.html<br>
small page with clock made with css and as small as possible amount of js 

# test_17
https://passvvord.github.io/<br>
in procces (PNG reader and fast base64 encoder deoder)

# test_18
https://passvvord.github.io/test/test_18/index.html<br>
generate texture with border for TextGeometry in THREE js using shader

# test_19
https://passvvord.github.io/test/test_19/index.html<br>
just interesting way to import some code (no visual) 

# test_20
https://passvvord.github.io/test/test_20/index.html<br>
just small simple 3D model of Earth with day and night textures

# test_21
https://passvvord.github.io/test/test_21/index.html<br>
infinite scrool example, using some new css functionality (but better to use more js instead of css here)

# test_22
https://passvvord.github.io/test/test_22/index.html<br>
interpolating textures and making smooth not blured edges beetween pixels<br>
now works only with 2 colors but expected to work with any amount

# test_23
https://passvvord.github.io/test/test_23/index.html<br>
small test of js lib which highlights code blocks with color

# test_24
https://passvvord.github.io/test/test_24/index.html<br>
small test to load excel file

# test_25
https://passvvord.github.io/test/test_25/index.html<br>
convert [8bit ANSI color code](https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit) to rgb chanels not just storing array but using small function<br>
smallest possible function: 
```js
function ff1(i){let f=Math.floor,j=i-16,v=(i-232)*10+8,a=128+127*f(i/8),b=i%3*f(i%9/7)*64,c=(a,b)=>a?f(b)*40+55:0;if(i<16){return[i%2*a+b,f(i/2%2)*a+b,f(i/4%2)*a+b]}else if(i<232){return[c(j>35,j/36),c(j%36>5,j%36/6),c(j%6>0,j%6)]}else{return[v,v,v]}}
```
(version which is readable is in [code](https://passvvord.github.io/test/test_25/index.html))

# test_26
https://passvvord.github.io/test/test_26/premissions_test.html
https://passvvord.github.io/test/test_26/index.html
