import request from "requestV2/index";
import PogObject from "PogData";
const rarities = JSON.parse(FileLib.read("DungeonPartyUtils", "rarities.json"))
const cataLevelArray = [0, 50, 125, 235, 395, 625, 955, 1425, 2095, 3045, 4385, 6275, 8940, 12700, 17960, 25340, 35640, 50040, 70040, 97640, 135640, 188140, 259640, 356640, 488640, 668640, 911640, 1239640, 1684640, 2284640, 3084640, 4149640, 5559640, 7459640, 9959640, 13259640, 17559640, 23159640, 30359640, 39559640, 51559640, 66559640, 85559640, 109559640, 139559640, 177559640, 225559640, 285559640, 360559640, 453559640, 569809640]

const data = new PogObject("DungeonPartyUtils", {
  apiKey: "",
  relevantItems: ["scylla", "hyperion", "astraea", "valkyrie", "terminator", "juju", "axe of the shredded", "livid dagger", "spirit bow", "last breath"],
});
data.save();
const chatPrefix = "§2[DPU]§r"

const getrequest = function(url) {
  return request({
      url: url,
      headers: {
          'User-Agent': 'Mozilla/5.0 (ChatTriggers)'
      },
      json: true
  });
}

function getCurrentProfile(player) {
  let profiles = player["profiles"]
  let curProfile = [0, "None"]
  profiles.forEach(profile => {
    if (profile["last_save"] > curProfile[0]) {
      curProfile = [profile["last_save"], profile["cute_name"]]
    }
  })
  return curProfile[1]
}

function decodeInv(data) {
  let bytearray = java.util.Base64.getDecoder().decode(data);
  let inputstream = new java.io.ByteArrayInputStream(bytearray);   
  let nbt = net.minecraft.nbt.CompressedStreamTools.func_74796_a(inputstream); //CompressedStreamTools.readCompressed()                            
  let items = nbt.func_150295_c("i", 10); //NBTTagCompound.getTagList()
  
  return items
}

function buildOutput(player, items, armor, secrets, pet, cata) {
  var output = new Message(
    "§cName:§b " + player + "\n§6Cata: §a" + cata.toString() + "\n§6Secrets: §c" + secrets + "\n§6Spirit: " + pet[1] + "\n\n§6Items:§r\n" + items + "\n§6Armor:§r\n" + armor + "\n§6Pet: §r" + pet[0],
     new TextComponent("\n§4[Kick from Party]").setClick("run_command", "/party kick " + player));
  ChatLib.chat(output)
}

function isDungeonItem(item) {
  Lore = item.func_74781_a("tag").func_74781_a("display").func_74781_a("Lore")
  if (Lore.toString().toLowerCase().includes("dungeon")) {
    return true
  }
  return false
}

register('Chat', (event) => {
  let unformattedMessage = ChatLib.removeFormatting(ChatLib.getChatMessage(event))
  unformattedMessage = unformattedMessage.replace(/ /g,"")

  let name = ""
  for (let i = 0;i<unformattedMessage.indexOf("joinedthedungeongroup");i++) {
      if (i > unformattedMessage.indexOf(">")) {
          name = name + unformattedMessage[i]
      }
  }

  getrequest("https://api.mojang.com/users/profiles/minecraft/" + name).then(response => {
    let uuid = response["id"];
    getrequest("https://api.hypixel.net/player?key=" + data.apiKey + "&uuid=" + uuid).then(response => {
      let secrets = response["player"]["achievements"]["skyblock_treasure_hunter"]
      if (secrets == undefined) {
        secrets = "0"
      }
      getrequest("https://api.hypixel.net/skyblock/profiles?key=" + data.apiKey + "&uuid=" + uuid).then(response => {
        let curProfile = getCurrentProfile(response)
        let profiles = response["profiles"]
        let itemString = ""
        let armorString = ""
        let pets = ["§cNone","§cNo"]
        let cata = -1
        profiles.forEach(profile => {
          if (profile["cute_name"] == curProfile) {
            if (profile["members"][uuid]["inv_contents"] != null) {
              // Build Item String

              let items = decodeInv(profile["members"][uuid]["inv_contents"]["data"])
              let length = items.func_74745_c(); //NBTTagList.tagCount()
              itemArray = []
              for(let i = 0; i < length; i++){                                    
                item = items.func_150305_b(i); //NBTTagList.getCompoundTagAt()
                if(!item.func_82582_d()) { //NBTTagCompound.hasNoTags()
                  Name = item.func_74781_a("tag").func_74781_a("display").func_74781_a("Name").toString().replace(/"/g,"") //NBTTagCompound.getTag()
                  itemArray.push(Name)
                }
              }
              string = ""
              for(let i = 0; i < itemArray.length; i++) {
                for (let j = 0; j < data.relevantItems.length; j++) {
                  if (itemArray[i].toLowerCase().includes(data.relevantItems[j])) {
                    string = string + " " + itemArray[i]
                  }
                }
              }
              if (string != "") {
                itemString = itemString + string + "§r\n"
              }
            }
            if (profile["members"][uuid]["inv_armor"] != null) {
              //Build Armor String

              let armor = decodeInv(profile["members"][uuid]["inv_armor"]["data"])
              let length2 = armor.func_74745_c();
              string = ""
              for (let i = length2; i > -1; i--) {
                armorPiece = armor.func_150305_b(i)
                if(!armorPiece.func_82582_d()) {
                  if (isDungeonItem(armorPiece)) {
                    Name = armorPiece.func_74781_a("tag").func_74781_a("display").func_74781_a("Name").toString().replace(/"/g,"")
                    string = string + " " + Name
                  }
                }
              }
              if (string != "") {
                armorString = armorString + string + "§r\n"
              }
            }
            if (profile["members"][uuid]["pets"] != null) {
              if (profile["members"][uuid]["pets"].length != 0) {
                for (let i = 0; i < profile["members"][uuid]["pets"].length; i++) {
                  if (profile["members"][uuid]["pets"][i]["type"] == "SPIRIT") {
                    pets[1] = "§aYes"
                  }
                  if (profile["members"][uuid]["pets"][i]["active"] == true) {
                    let type = profile["members"][uuid]["pets"][i]["type"]
                    type = type.toLowerCase()
                    type = type[0].toUpperCase() + type.slice(1,type.length)
                    type = type.replace(/_/g, " ")
                    if (pets[0] != "§cNone") {
                      pets[0] = pets[0] + rarities[profile["members"][uuid]["pets"][i]["tier"]] + type + "§r\n"   
                    } else {
                      pets[0] = rarities[profile["members"][uuid]["pets"][i]["tier"]] + type + "§r\n"
                    }
                  }
                }
              }
            }
            for (let i = 0; i < cataLevelArray.length; i++) {
              	let cataXP = Math.floor(profile["members"][uuid]["dungeons"]["dungeon_types"]["catacombs"]["experience"])
                if (cataLevelArray[i] <= cataXP) {
                  cata += 1
                }
            }
          } 
        })
        buildOutput(name, itemString, armorString, secrets, pets, cata)
      })
    })
  });
}).setChatCriteria("joined the dungeon group!").setContains();

register("command", (...args) => {
  const helpMessage = "§6Help\n§a/dpu key <API key>\n§2Set your api key.\n§a/dpu add <item>\n§2Add an Item to check for.\n§a/dpu remove <item>\n§2Remove an item that is being checked for.\n§a/dpu list\n§2List all items the mod currently checks for."
  if (args) {
    if (args[0] == "key") {
      if (args[1]) {
        getrequest("https://api.hypixel.net/player?key="+args[1]+"&uuid=6abd94a3f33940dd95e49eaa46ee8016").then(response => {
          data.apiKey = args[1]
          data.save()
          ChatLib.chat("§aSuccessfully set the API key!")
        }).catch(error => {
          if (error["cause"] == "Invalid API key") {
            ChatLib.chat("§cAPI Key is invalid!")
          }
        })
      } else {
        ChatLib.chat("§cDidn't provide an API key!")
      }
    } else if (args[0] == "add") {
      if (args[1]) {
        if (!data.relevantItems.includes(args.slice(1).join(" ").toLowerCase())) {
          data.relevantItems.push(args.slice(1).join(" ").toLowerCase())
          data.save()
          ChatLib.chat("§aThe mod now checks for " + args.slice(1).join(" ") + ".")
        } else {
          ChatLib.chat("§cItem is already being checked.")
        }
      } else {
        ChatLib.chat("§cDidn't provide an item.")
      }
    } else if (args[0] == "remove") {
      if (args[1]) {
        if (data.relevantItems.includes(args.slice(1).join(" ").toLowerCase())) {
          data.relevantItems.splice(data.relevantItems.indexOf(args.slice(1).join(" ").toLowerCase()),1)
          data.save()
          ChatLib.chat("§aThe mod no longer checks for " + args.slice(1).join(" ") + ".")
        } else {
          ChatLib.chat("§cItem isn't being checked.")
        }
      } else {
        ChatLib.chat("§cDidn't provide an item.")
      }
    } else if (args[0] == "list") {
      string = "§2Mod currently checks for:\n"
      for (let i = 0; i < data.relevantItems.length; i++) {
        if (i != data.relevantItems.length - 1) {
          string = string + "§a" + data.relevantItems[i] + ", "
        } else {
          string = string + "§a" + data.relevantItems[i]
        }
      }
      ChatLib.chat(string)
    } else {
      ChatLib.chat(helpMessage)
    }
  } else {
    ChatLib.chat(helpMessage)
  }
}).setName("dpu")

register('Chat', (event) => {
  let unformattedMessage = ChatLib.removeFormatting(ChatLib.getChatMessage(event))
  unformattedMessage = unformattedMessage.replace(/ /g, "").replace("YournewAPIkeyis", "")
  getrequest("https://api.hypixel.net/player?key="+unformattedMessage+"&uuid=6abd94a3f33940dd95e49eaa46ee8016").then(response => {
    ChatLib.chat(chatPrefix + " §aYour key has been set to §6" + unformattedMessage)
    data.apiKey = unformattedMessage
    data.save()
  })
}).setChatCriteria("Your new API key is ").setContains()
