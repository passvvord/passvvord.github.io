function baseStr(int,base=10) {
	return `${int.toString(base)}${String.fromCodePoint(...base.toString().split('').map(a=>0x2080+parseInt(a)))}`
}

function addSymbols(from, to, w, link) {
	const dce = s=>document.createElement(s);
	// const h = Math.ceil((to-from)/w)

	const table = dce('table')
	const caption = table.appendChild(dce('caption'))
	caption.textContent = `unicode symbols by codePoint in range ${baseStr(from,16)}-${baseStr(to,16)} or ${baseStr(from)}-${baseStr(to)} `
	caption.appendChild(dce('br'))

	const span = caption.appendChild(dce('span'))
	span.textContent = 'copy link on table below'
	span.classList.add('noselect')
	span.addEventListener('click',c=>{
		navigator.clipboard.writeText(window.location.origin + window.location.pathname + link)
		
		if (span.getAttribute('timeoutID') != undefined) {
			span.classList.remove('copied')
			clearTimeout(parseInt(span.getAttribute('timeoutID')))
			// span.removeAttribute('timeoutID')
		}

		span.classList.add('copied')
		span.setAttribute('timeoutID', setTimeout(()=>{
			span.classList.remove('copied')
			span.removeAttribute('timeoutID')
		}, 1000))
	})

	const a = caption.appendChild(dce('a'))
	a.classList.add('noselect')
	a.setAttribute('href', link)
	a.textContent = 'open only table below'

	const thead = table.appendChild(dce('thead'))
	thead.appendChild(dce('th'))
	for (let i = 0; i < w; i++) {
		thead.appendChild(dce('th')).textContent = `${i.toString(16).padStart(Math.ceil(Math.log2(w)/4),'0')}`
	}

	const tbody = table.appendChild(dce('tbody'))
	for (let i = Math.floor(from/w)*w; i < Math.ceil(to/w)*w; i+=w) {
		const tr = tbody.appendChild(dce('tr'))
		const th = tr.appendChild(dce('th'))
		th.textContent = `0x${i.toString(16).padStart(Math.ceil(Math.log2(to)/4),'0')}+${'.'.repeat(Math.ceil(Math.log2(w)/4))}`

		for (let j = i; j < i+w; j++) {
			const td = tr.appendChild(dce('td'))
			td.textContent = String.fromCodePoint(j)
			if (j < from || j > to) {
				td.classList.add('outOfBounds')
			}
		}
	}

	return table
}

const searchCheckParse = {
	codePointBounds: {
		// ...x0-5f6...
		default: undefined,

		// limits for symbols per number set by max supported utf symbol code (0x10FFFF)
		regBin   :'(?<base>b)(?<n0>[01]{1,21})(?<type>\\+-|-)(?<n1>[01]{1,21})',
		regDec   :'(?<base>d)(?<n0>[0-9]{1,7})(?<type>\\+-|-)(?<n1>[0-9]{1,7})',
		regHex   :'(?<base>x)(?<n0>[0-9a-f]{1,6})(?<type>\\+-|-)(?<n1>[0-9a-f]{1,6})',
		regBase36:'(?<base>a)(?<n0>[0-9a-z]{1,4})(?<type>\\+-|-)(?<n1>[0-9a-z]{1,4})',
		get reg(){return `${this.regBin}|${this.regDec}|${this.regHex}|${this.regBase36}`},

		parseNames: ['base','type','n0','n1'],
		parseSteps: [{
			base: o=>({'b':2,'d':10,'x':16,'a':36})[o.base],
		},{
			n0: o=>parseInt(o.n0,o.base),
			n1: o=>parseInt(o.n1,o.base),
		},{
			n0: o=>o.type==='+-' ? Math.max(o.n0-o.n1,0) : o.n0,
			n1: o=>o.type==='+-' ?          o.n0+o.n1    : o.n1,
		},{
			n1: o=>Math.min(o.n1, 0x10FFFF)
		},{
			n0: o=>Math.min(o.n0, o.n1)
		}],
		toUrlPart: o=>`x${o.n0.toString(16)}-${o.n1.toString(16)}`
		// toUrlPart: o=>{
		// 	//({2:'b',10:'d',16:'x',36:'a'})[o.base]
		// }
	},
	linesPerTable: {
		// ...L4...
		default: {count: 4},

		reg: 'L(?<count>[0-9]{1,3})', //max: 999
		parseNames: ['count'],
		parseSteps: [{
			count: o=>Math.max(parseInt(o.count),1),
		}],
		toUrlPart(o) {return o.count === this.default.count ? '' : `L${o.count}`}
	},
	symbolsPerLine: {
		// ...S64...
		default: {count: 64},

		reg: 'S(?<count>[0-9]{1,3})', //max: 999
		parseNames: ['count'],
		parseSteps: [{
			count: o=>Math.max(parseInt(o.count),1),
		}],
		toUrlPart(o) {return o.count === this.default.count ? '' : `S${o.count}`}
	}
}

function getSearchParams(search,regDict = searchCheckParse) {
	const requiredCount = Object.keys(regDict).reduce((ac,key)=>ac+(regDict[key].default===undefined),0)
	const allCount = Object.keys(regDict).length
	const fullReg = `(?:${Object.values(regDict).map(v=>v.reg).join('|')})`

	if ( new RegExp(`(?<=^\\?)${fullReg}{${requiredCount},${allCount}}$`).test(search) ) {
		const matched = {}
		for (key in regDict) {
			if ( new RegExp(regDict[key].reg).test(search) ) {
				const match = search.match(new RegExp(regDict[key].reg, 'g'))
				if (match.length > 1) {
					console.error(`structure ${key} appeats twice or more`,match)
				}
				const preRarsedResult = Object.fromEntries(match[0].replaceAll(
					 new RegExp(regDict[key].reg, 'g')
					,regDict[key].parseNames.map(a=>`$<${a}>`
				).join(' ')).split(' ').map((a,i)=>[regDict[key].parseNames[i],a]))

				for (step of regDict[key].parseSteps) {
					let temp = {}
					for (variable in step) {
						temp[variable] = step[variable](preRarsedResult)
					}
					Object.assign(preRarsedResult, temp)
				}
				matched[key] = preRarsedResult
			} else {
				if (regDict[key].default === undefined) {
					console.error(`${key} must be in search string, but regExp can't find ${key} in it, looks like other structure appeats twice or more`)
				} else {
					matched[key] = regDict[key].default;
				}
			}
		}
		return matched
	} else {
		console.error('search don`t match regDict')
	}
}

function urlByParams(params,regDict = searchCheckParse) {
	let result = '?'
	for (key in params) {
		result+=regDict[key].toUrlPart(params[key])
	}
	return result
}

/* // old version of code below
if (window.location.search.length > 1) {
	// limits for symbols per number set by max supported utf symbol code (0x10FFFF)
	const regBin    = '(?<base>b)(?<n0>[01]{1,21})-(?<n1>[01]{1,21})'
	const regDec    = '(?<base>d)(?<n0>[0-9]{1,7})-(?<n1>[0-9]{1,7})'
	const regHex    = '(?<base>x)(?<n0>[0-9a-f]{1,6})-(?<n1>[0-9a-f]{1,6})'
	const regBase36 = '(?<base>a)(?<n0>[0-9a-z]{1,4})-(?<n1>[0-9a-z]{1,4})'
	var fullReg   = `^\\?(?:${regBin}|${regDec}|${regHex}|${regBase36})$`

	if ( new RegExp(fullReg).test(window.location.search) ) {
		const props = window.location.search.replaceAll(new RegExp(fullReg,'g'),'$<base> $<n0> $<n1>').split(' ')
		const base = ({'b':2,'d':10,'x':16,'a':36})[props[0]]
		var n0 = parseInt(props[1],base)
		var n1 = parseInt(props[2],base)
		n1 = Math.min(n1, 0x10FFFF)
		n0 = Math.min(n0, n1)
		console.log(props,[base,n0,n1])

		const symbolsPerTable = 256
		for (let i = Math.floor(n0/symbolsPerTable)*symbolsPerTable; i < Math.ceil(n1/symbolsPerTable)*symbolsPerTable; i+=symbolsPerTable) {
			document.querySelector('#text').appendChild(addSymbols( Math.max(i,n0), Math.min(i+symbolsPerTable,n1) ))
		}
		
	} else {
		alert(`${window.location.search} must be in format:\n ?{b or d or x or a}{start}-{end}\n\nfull regExp which is testing string: ${fullReg}`)
		console.error()
	}
}
*/

if (window.location.search.length > 1) {
	const params = getSearchParams(window.location.search)
	console.log(window.location.search, urlByParams(params))

	const symbolsPerTable = params.linesPerTable.count*params.symbolsPerLine.count
	const tableStart = Math.floor(params.codePointBounds.n0/symbolsPerTable)*symbolsPerTable
	const tableEnd   = Math.ceil (params.codePointBounds.n1/symbolsPerTable)*symbolsPerTable

	const tempParams = structuredClone(params)

	const element = document.querySelector('#text')

	tempParams.codePointBounds.n0 = Math.max( 0, params.codePointBounds.n0 - (params.codePointBounds.n1 - params.codePointBounds.n0) )
	tempParams.codePointBounds.n1 = Math.max( tempParams.codePointBounds.n0, params.codePointBounds.n0 )

	if (tempParams.codePointBounds.n1 > tempParams.codePointBounds.n0) {
		const aBefore = element.appendChild(document.createElement('a'))
		aBefore.setAttribute('href',urlByParams(tempParams))
		aBefore.textContent = `<< previous symbols (${baseStr(tempParams.codePointBounds.n0,16)}-${baseStr(tempParams.codePointBounds.n1,16)})`		
	}

	for (let i = tableStart; i < tableEnd; i+=symbolsPerTable) {
		const start = Math.max(i                ,params.codePointBounds.n0)
		const end   = Math.min(i+symbolsPerTable,params.codePointBounds.n1)
		tempParams.codePointBounds.n0 = start
		tempParams.codePointBounds.n1 = end

		element.appendChild(addSymbols(
			 start
			,end
			,params.symbolsPerLine.count
			,urlByParams(tempParams)
		))
	}

	tempParams.codePointBounds.n1 = Math.min( params.codePointBounds.n1 + (params.codePointBounds.n1 - params.codePointBounds.n0), 0x10FFFF )
	tempParams.codePointBounds.n0 = Math.min( tempParams.codePointBounds.n1, params.codePointBounds.n1)

	if (tempParams.codePointBounds.n0 < tempParams.codePointBounds.n1) {
		const aAfter = element.appendChild(document.createElement('a'))
		aAfter.setAttribute('href',urlByParams(tempParams))
		aAfter.textContent = `next symbols (${baseStr(tempParams.codePointBounds.n0,16)}-${baseStr(tempParams.codePointBounds.n1,16)}) >>`		
	}
}