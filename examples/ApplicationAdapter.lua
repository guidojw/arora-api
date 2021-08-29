local HttpService = game:GetService("HttpService")
local ServerScriptService = game:GetService("ServerScriptService")

local Environment = require(ServerScriptService.Environment)

return function(method, pathname, body)
    return HttpService:RequestAsync({
		    Url = Environment.HOST.. "/" ..pathname,
        Method = method,
        Headers = {
            ["Content-Type"] = "application/json",
            ["Authorization"] = "Bearer " ..Environment.TOKEN
        },
        Body = body and HttpService:JSONEncode(body) or nil
	  })
end
