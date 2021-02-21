const flow = require("./interactive_flow");

//=====================================================================================
// HANDLE LOGIC FOR INTERACTIVE CONVO
//=====================================================================================
function checkStopRequest(client, message, convo)
{
	if (convo.step > 0 && convo.step < convo.selCmdFlow.steps.length) // if within collection steps
	{
		if (convo.selCmdFlow.steps[convo.step].ignoreAltCmdsCheck) {return false}
	}
	return checkIfPass(client, message, convo, flow.stopFlow.steps[0]);
};

//-------------------------------------------------------------------------------------
function checkHelpRequest(client, message, convo)
{
	if (convo.step > 0 && convo.step < convo.selCmdFlow.steps.length) // if within collection steps
	{
		if (convo.selCmdFlow.steps[convo.step].ignoreAltCmdsCheck) {return false}
	}
	return checkIfPass(client, message, convo, flow.intHelpCmdFlow.steps[0]);
};

//-------------------------------------------------------------------------------------
function doIntHelp(client, message, convo)
{
	if (convo.step === 0) {return genHelpList()}
	if (convo.step < convo.selCmdFlow.steps.length) {return convo.selCmdFlow.steps[convo.step].helpMsg(client, message)}
	if (convo.atConf) {return flow.confCmdFlow.helpMsg(client, message)}
};

//-------------------------------------------------------------------------------------
function doFirstStep(client, message, convo)
{
	let impliedCmds;
	let iniFailMsg;
	let descs;
	let x;

	impliedCmds = flow.interactiveCmdsFlow.cmds().filter(cmd => checkIfPass(client, message, convo, cmd.steps[0])); //returns array of flow objs

	if (impliedCmds.length === 1)
	{
		Object.assign(convo.selCmdFlow, impliedCmds[0]);
		Object.assign(convo.selCmdObj, impliedCmds[0].linkedCmdObj);

		iniFailMsg = convo.selCmdFlow.paramFillFnc(client, message, convo);

		if (!iniFailMsg)
		{
			return setupNextStep(client, message, convo);
		}
		else
		{
			convo.selCmdFlow = {};
			convo.selCmdObj = {};
			return iniFailMsg;
		}

	}
	else if (impliedCmds.length === 0)
	{
		return `Hmmm, I can't quite figure out what you want, could you rephrase it?\n If you need help you can also ask.`;
	}
	else
	{
		for(x in impliedCmds)
		{
			descs += impliedCmds[x].description + '\n';
		}
		
		return `Hmmm, im not quite sure what you want, wich one did you mean:\n${descs}`;
	}
};

//-------------------------------------------------------------------------------------
function doInfoCollectSteps(client, message, convo)
{
	let currentStep;
	let colFailMsg;

	currentStep = convo.step;
	colFailMsg = convo.selCmdFlow.steps[currentStep].stepColFnc(client, message, convo); // returns true/false

	if (!colFailMsg)
	{
		return setupNextStep(client, message, convo);
	}
	else
	{
		return colFailMsg + '\n' + convo.selCmdFlow.steps[convo.step].question();
	}
};

//-------------------------------------------------------------------------------------
function doConfirmStep(client, message, convo)
{
	let pass;
	let fail;

	pass = checkIfPass(client, message, convo, flow.confCmdFlow.answers[0]); //if answer is yes
	fail = checkIfPass(client, message, convo, flow.confCmdFlow.answers[1]); //if answer is no

	if (convo.step === convo.selCmdFlow.steps.length)
	{
		if (!pass && !fail) {return 'unsure'}
		if (pass) {return 'pass'}
		if (fail)
		{
			convo.step += 1;
			return 'fail';
		}
	}
	else if (convo.step === convo.selCmdFlow.steps.length + 1)
	{
		if (!pass && !fail) {return 'unsure'}
		if (pass)
		{
			Object.assign(convo.selCmdObj, convo.selCmdFlow.linkedCmdObj);

			convo.step = 0;
			convo.atConf = false;
			
			return 'restart';
		}
		if (fail) {return 'end'}
	}

};

//=====================================================================================
// SUBORDINATE FUNCTIONS
//=====================================================================================
function checkIfPass(client, message, convo, flowStep)
{
	let userMsg;

	userMsg = message.content.toLowerCase();
	
	if (!!flowStep.userMustInc1) return (flowStep.userMustInc.some(word => userMsg.includes(word)) && flowStep.userMustInc1.some(word => userMsg.includes(word)) && !flowStep.userMustNotInc.some(word => userMsg.includes(word)));
	else return (flowStep.userMustInc.some(word => userMsg.includes(word)) && !flowStep.userMustNotInc.some(word => userMsg.includes(word)));
	//checks words in message against arrays in flowLogic, returns true/false

};

//-------------------------------------------------------------------------------------
function setupNextStep(client, message, convo)
{
	convo.step += 1;

	if (convo.step >= convo.selCmdFlow.steps.length) //reached confirmation
	{
		convo.atConf = true;

		convo.selCmdFlow.confMsgFnc(client, message, convo);

		return `So you want to ${convo.selCmdObj.interConfMsg}.\nIs that correct?`;
	}
	else return convo.selCmdFlow.steps[convo.step].question();
	
};

//-------------------------------------------------------------------------------------
function genHelpList()
{
	let outputText;
	let x;

	outputText = `Here\'s a list of things I can do:`
	for (x in flow.interactiveCmdsFlow.cmds())
	{
		outputText += '\n' + flow.interactiveCmdsFlow.cmds()[x].description;
	}

	return outputText;
};
//=====================================================================================
module.exports =
{
	checkStopRequest,
	checkHelpRequest,
	doIntHelp,
	doFirstStep,
	doInfoCollectSteps,
	doConfirmStep,
	setupNextStep,
};