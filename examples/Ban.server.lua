local HttpService = game:GetService("HttpService")
local ServerScriptService = game:GetService("ServerScriptService")

local ApiAdapter = require(ServerScriptService.ApplicationAdapter)

local function ban(groupId, userId, authorId, duration, reason)
    local response = ApiAdapter("POST", "v1/groups/" ..groupId.. "/bans", {
        userId = userId,
        authorId = authorId,
        duration = typeof(duration) == "nil" and nil or duration * 24 * 60 * 60 * 1000,
        reason = reason
    })
    if not response.Success then
        error(response.StatusMessage)
    end
    return HttpService:JSONDecode(response.Body)
end

-- print(ban(1018818, 156, 6882179, 2, "2 days tempban"))
