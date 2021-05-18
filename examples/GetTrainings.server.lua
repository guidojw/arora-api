local HttpService = game:GetService("HttpService")
local ServerScriptService = game:GetService("ServerScriptService")

local ApiAdapter = require(ServerScriptService.ApplicationAdapter)

local function getTrainings(groupId)
    local response = ApiAdapter("GET", "v1/groups/" ..groupId.. "/trainings?sort=date")
    if not response.Success then
        error(response.StatusMessage)
    end
    return HttpService:JSONDecode(response.Body)
end

-- print(getTrainings(1018818))
