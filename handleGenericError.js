const { errorList } = require('./errorList.json');

//==============================================================
// ERROR HANNDLING
//==============================================================
// handle error generic errors
function handleGenericError(client, message, reportedError, arbitrFuncID) 
{
	const genericErrorMsg = errorList[Math.floor(Math.random() * errorList.length)];

	console.log(reportedError.name + '\n' + reportedError.message);

	message.channel.send(genericErrorMsg + `\n error ref code: **${arbitrFuncID}** - ${reportedError.name}`);
}
exports.handleGenericError = handleGenericError;
