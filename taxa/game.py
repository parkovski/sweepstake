global _pypyjson
import _pypyjson

# join
@taxa.route("/join")
def join():
    rawData = _pypyjson.loads(request.data)
    my_id = rawData["name"]
    session[my_id] = -1
    session["end_game"] = False
    response.add(my_id + " joined the game")
    return

# commit
@taxa.route("/commit")
def commit():
    rawData = _pypyjson.loads(request.data)
    my_id = rawData["name"]
    my_value = rawData["value"]
    if my_id in session:
        session[my_id] = my_value
        session["end_game"] = False
    response.add(my_id + " commited to " + my_value)
    return

# reveal is called after the round
@taxa.route("/reveal")
def reveal_and_evaluate():
    share = []
    block = []
    steal = []
    eliminated = []
    winners = []

    # cycle through all ids
    for id, move in session.iteritems():
        if type(move) is not int:
            continue
        elif move == 0:
            share.append(id)
        elif move == 1:
            steal.append(id)
        elif move == 2:
            block.append(id)
        else:
            eliminated.append(id)

    # evaluate which end round state
    if len(share) > 0:
        if len(steal) > 0:
            if len(block) > 0:
                # eliminate steal arr
                eliminated.extend(steal)
            else:
                # split steal
                eliminated.extend(share).extend(block)
                session["end_game"] = True
        elif len(block) > 0:
            # eliminate block arr
            eliminated.extend(block)
        else:
            # split share
            eliminated.extend(steal).extend(block)
            session["end_game"] = True
    else:
        if len(steal) > 0:
            if len(block) > 0:
                # eliminate steal
                eliminated.extend(steal)
            else:
                # all steal
                # everyone loses (except the devs!!! woohoo :)
                eliminated.extend(steal)
                session["end_game"] = True
        else:
            # all block
            # everyone loses (except the devs!!! woohoo :)
            eliminated.extend(block)
            session["end_game"] = True

    # iterate through eliminate arr
    for id in eliminated:
        del session[id]

    # reset session values for next round
    for k, v in session.iteritems():
        if type(v) is not int:
            continue
        else:
            winners.append(k)
            session[k] = -1

    # if end game, show winners
    if session["end_game"] == True:
        if len(winners) > 0:
            response.add("Winner Chicken Dinner:" + ','.join(winners))
        else:
            response.add("Winner Chicken Dinner: THE DEVS WOOHOO")
    else:
        response.add('Eliminated:' + ','.join(eliminated))
    return

# check if id is active
@taxa.route("/active")
def active():
    rawData = _pypyjson.loads(request.data)
    my_id = rawData["name"]
    if my_id in session:
        response.add(my_id + " is an active player")
    else:
        response.add(my_id + " is dead")

# check if game is still ongoing or ended
@taxa.route("/is_game_finished")
def game_state():
    if session["end_game"] == True:
        response.add("GAME OVER")
    else:
        response.add("Game still ongoing")

# reset
@taxa.route("/reset")
def reset():
    # if session["end_game"] == True:
        # wipe session values
    for k, v in session.iteritems():
        del session[k]
    # session = {"end_game": False}
    # start new round
    response.add("Reset and Started New Game")
    return
