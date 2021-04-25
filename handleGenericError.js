const { errorList } = require('./errorList.json');

//==============================================================
// ERROR HANNDLING
//==============================================================
// handle error generic errors
function handleGenericError(client, message, reportedError, arbitrFuncID) 
{
	const genericErrorMsg = errorList[Math.floor(Math.random() * errorList.length)];

	if(!reportedError) {return}

	switch (typeof(reportedError))
	{
		case 'string':
			message.channel.send(genericErrorMsg + `\n error ref code: **${arbitrFuncID}** - ${reportedError}`);
			console.log(reportedError);
			break;
		case 'object':
			if (!!reportedError.name)
			{
				message.channel.send(genericErrorMsg + `\n error ref code: **${arbitrFuncID}** - ${reportedError.name}`);
				console.log(reportedError.name + '\n' + reportedError.message);
				break;
			}
		default:
			message.channel.send(genericErrorMsg + `\n error ref code: **${arbitrFuncID}** - unknown error`)
	}
};
exports.handleGenericError = handleGenericError;
